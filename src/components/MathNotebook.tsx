import { useMemo, useState } from 'react';
import { Mafs, Polygon, Polyline, Text } from 'mafs';
import { formatPercent } from '../utils/bayesian';
import { Fraction, LatexFormula } from './LatexFormula';

interface MathNotebookProps {
  currentProbability: number;
  draftLikelihoodIfTrue: number;
  draftLikelihoodIfFalse: number;
  evidenceCount: number;
}

const COLORS = {
  signal: '#059669', // emerald-600
  noise: '#e11d48', // rose-600
  bg: '#e5e7eb', // gray-200
  outline: '#9ca3af', // gray-400
};

type HoverFocus =
  | 'prior_h'
  | 'prior_false'
  | 'gate_wh'
  | 'gate_wfalse'
  | 'gate_pe'
  | 'discard'
  | 'post_h'
  | 'post_false'
  | null;

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function formatBf(bf: number) {
  if (!Number.isFinite(bf)) return 'Infx';
  if (bf >= 100) return `${bf.toFixed(0)}x`;
  if (bf >= 10) return `${bf.toFixed(1)}x`;
  return `${bf.toFixed(2)}x`;
}

function interpretBf(bf: number): { label: string; className: string } {
  if (!Number.isFinite(bf) || bf > 10) return { label: 'Strong Evidence', className: 'text-emerald-700' };
  if (bf < 2) return { label: 'Weak Evidence', className: 'text-gray-600' };
  return { label: 'Moderate Evidence', className: 'text-rose-700' };
}

function focusHighlightClass(active: boolean) {
  return active ? 'rounded px-1 ring-2 ring-amber-300 ring-offset-2 ring-offset-gray-50' : '';
}

function cubicBezierPoints(
  start: [number, number],
  c1: [number, number],
  c2: [number, number],
  end: [number, number],
  steps: number
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const mt = 1 - t;
    const x =
      mt ** 3 * start[0] +
      3 * mt ** 2 * t * c1[0] +
      3 * mt * t ** 2 * c2[0] +
      t ** 3 * end[0];
    const y =
      mt ** 3 * start[1] +
      3 * mt ** 2 * t * c1[1] +
      3 * mt * t ** 2 * c2[1] +
      t ** 3 * end[1];
    pts.push([x, y]);
  }
  return pts;
}

function BayesFlowDiagram({
  pH,
  wH,
  wNotH,
  pE,
  posteriorH,
  hoverFocus,
  onHoverFocusChange,
}: {
  pH: number;
  wH: number;
  wNotH: number;
  pE: number;
  posteriorH: number;
  hoverFocus: HoverFocus;
  onHoverFocusChange: (focus: HoverFocus) => void;
}) {
  // Coordinate system: x in [0, 3], y in [0, 1]
  const xPrior0 = 0.25;
  const xPrior1 = 0.45;
  const xGate0 = 1.42;
  const xGate1 = 1.58;
  const xPost0 = 2.55;
  const xPost1 = 2.75;

  const priorNoise = clamp01(1 - pH);
  const priorSignal0 = priorNoise;
  const priorSignal1 = 1;

  const gateNoise0 = 0;
  const gateNoise1 = clamp01(wNotH);
  const gateSignal0 = gateNoise1;
  const gateSignal1 = clamp01(wNotH + wH); // equals pE

  const posteriorNoise = clamp01(1 - posteriorH);
  const postNoise0 = 0;
  const postNoise1 = posteriorNoise;
  const postSignal0 = postNoise1;
  const postSignal1 = 1;

  const flowOpacity = 0.22;

  const cursorStyle = { cursor: 'help' as const };
  const strokeFor = (focus: HoverFocus) => (hoverFocus === focus ? 0.95 : 0);
  const weightFor = (focus: HoverFocus) => (hoverFocus === focus ? 3 : 0);

  const curveStart: [number, number] = [xPrior1, 1];
  const curveEnd: [number, number] = [xGate0, gateSignal1];
  const curve = cubicBezierPoints(
    curveStart,
    [0.78, 0.98],
    [1.16, Math.max(0.2, gateSignal1 + 0.1)],
    curveEnd,
    28
  );

  return (
    <Mafs
      height={220}
      pan={false}
      zoom={false}
      preserveAspectRatio={false}
      viewBox={{ x: [0, 3], y: [0, 1] }}
    >
      {/* Flow ribbons (prior -> gate) */}
      <Polygon
        points={[
          [xPrior1, 0],
          [xGate0, gateNoise0],
          [xGate0, gateNoise1],
          [xPrior1, priorNoise],
        ]}
        color={COLORS.noise}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xPrior1, priorNoise],
          [xGate0, gateSignal0],
          [xGate0, gateSignal1],
          [xPrior1, priorSignal1],
        ]}
        color={COLORS.signal}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />

      {/* Flow ribbons (gate -> posterior) */}
      <Polygon
        points={[
          [xGate1, gateNoise0],
          [xPost0, postNoise0],
          [xPost0, postNoise1],
          [xGate1, gateNoise1],
        ]}
        color={COLORS.noise}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xGate1, gateSignal0],
          [xPost0, postSignal0],
          [xPost0, postSignal1],
          [xGate1, gateSignal1],
        ]}
        color={COLORS.signal}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />

      {/* Prior bar */}
      <Polygon
        points={[
          [xPrior0, 0],
          [xPrior1, 0],
          [xPrior1, priorNoise],
          [xPrior0, priorNoise],
        ]}
        color={COLORS.noise}
        fillOpacity={1}
        strokeOpacity={strokeFor('prior_false')}
        weight={weightFor('prior_false')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('prior_false'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Polygon
        points={[
          [xPrior0, priorSignal0],
          [xPrior1, priorSignal0],
          [xPrior1, priorSignal1],
          [xPrior0, priorSignal1],
        ]}
        color={COLORS.signal}
        fillOpacity={1}
        strokeOpacity={strokeFor('prior_h')}
        weight={weightFor('prior_h')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('prior_h'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Polygon
        points={[
          [xPrior0, 0],
          [xPrior1, 0],
          [xPrior1, 1],
          [xPrior0, 1],
        ]}
        color={COLORS.outline}
        fillOpacity={0}
        strokeOpacity={1}
        weight={2}
      />

      {/* Evidence gate */}
      <Polygon
        points={[
          [xGate0, 0],
          [xGate1, 0],
          [xGate1, gateNoise1],
          [xGate0, gateNoise1],
        ]}
        color={COLORS.noise}
        fillOpacity={1}
        strokeOpacity={strokeFor('gate_wfalse')}
        weight={weightFor('gate_wfalse')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('gate_wfalse'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Polygon
        points={[
          [xGate0, gateSignal0],
          [xGate1, gateSignal0],
          [xGate1, gateSignal1],
          [xGate0, gateSignal1],
        ]}
        color={COLORS.signal}
        fillOpacity={1}
        strokeOpacity={strokeFor('gate_wh')}
        weight={weightFor('gate_wh')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('gate_wh'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />

      {/* Discarded mass (evidence not observed) */}
      {pE < 1 && (
        <Polygon
          points={[
            [xGate0, gateSignal1],
            [xGate1, gateSignal1],
            [xGate1, 1],
            [xGate0, 1],
          ]}
          color={COLORS.bg}
          fillOpacity={0.85}
          strokeOpacity={strokeFor('discard')}
          weight={weightFor('discard')}
          svgPolygonProps={{
            onMouseEnter: () => onHoverFocusChange('discard'),
            onMouseLeave: () => onHoverFocusChange(null),
            style: cursorStyle,
          }}
        />
      )}

      {/* Dashed outline around total likelihood P(E) */}
      <Polygon
        points={[
          [xGate0, 0],
          [xGate1, 0],
          [xGate1, gateSignal1],
          [xGate0, gateSignal1],
        ]}
        color={COLORS.outline}
        fillOpacity={0}
        strokeOpacity={0.9}
        strokeStyle="dashed"
        weight={2}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('gate_pe'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Text x={xGate1 + 0.08} y={Math.min(0.92, gateSignal1 + 0.05)} size={14} color="#6b7280" attach="w">
        P(E)
      </Text>

      {/* Guide curve showing flow */}
      <Polyline points={curve} color={COLORS.signal} weight={2} strokeOpacity={0.65} />

      <Polygon
        points={[
          [xGate0, 0],
          [xGate1, 0],
          [xGate1, 1],
          [xGate0, 1],
        ]}
        color={COLORS.outline}
        fillOpacity={0}
        strokeOpacity={1}
        weight={2}
      />

      {/* Posterior bar */}
      <Polygon
        points={[
          [xPost0, postNoise0],
          [xPost1, postNoise0],
          [xPost1, postNoise1],
          [xPost0, postNoise1],
        ]}
        color={COLORS.noise}
        fillOpacity={1}
        strokeOpacity={strokeFor('post_false')}
        weight={weightFor('post_false')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('post_false'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Polygon
        points={[
          [xPost0, postSignal0],
          [xPost1, postSignal0],
          [xPost1, postSignal1],
          [xPost0, postSignal1],
        ]}
        color={COLORS.signal}
        fillOpacity={1}
        strokeOpacity={strokeFor('post_h')}
        weight={weightFor('post_h')}
        svgPolygonProps={{
          onMouseEnter: () => onHoverFocusChange('post_h'),
          onMouseLeave: () => onHoverFocusChange(null),
          style: cursorStyle,
        }}
      />
      <Polygon
        points={[
          [xPost0, 0],
          [xPost1, 0],
          [xPost1, 1],
          [xPost0, 1],
        ]}
        color={COLORS.outline}
        fillOpacity={0}
        strokeOpacity={1}
        weight={2}
      />
    </Mafs>
  );
}

type DotKind = 'signal' | 'noise';

function DotGrid({ dots }: { dots: { kind: DotKind; active: boolean }[] }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {dots.map((d, idx) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className="w-2.5 h-2.5 rounded-full border border-gray-200"
          style={{
            backgroundColor: d.kind === 'signal' ? COLORS.signal : COLORS.noise,
            opacity: d.active ? 1 : 0.14,
          }}
        />
      ))}
    </div>
  );
}

function Tip({ title }: { title: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-500 text-[10px] leading-none"
      title={title}
    >
      ?
    </span>
  );
}

function focusInfo(focus: HoverFocus) {
  if (!focus) {
    return {
      title: 'Hover a segment',
      body: 'Hover a bar segment or the dashed gate outline to see what part of the math it represents.',
    };
  }

  switch (focus) {
    case 'prior_h':
      return { title: 'Prior P(H)', body: 'Green prior mass: your current belief the thesis is true.' };
    case 'prior_false':
      return { title: 'Prior P(False)', body: 'Red prior mass: your current belief the thesis is false (1 - P(H)).' };
    case 'gate_wh':
      return { title: 'Kept signal w_H', body: 'Green kept mass after filtering: w_H = P(H) x P(E|H).' };
    case 'gate_wfalse':
      return { title: 'Kept noise w_F', body: 'Red kept mass after filtering: w_F = P(False) x P(E|False).' };
    case 'gate_pe':
      return { title: 'Total likelihood P(E)', body: 'Total mass that survives the filter: P(E) = w_H + w_F.' };
    case 'discard':
      return { title: 'Discarded mass', body: 'Worlds where the evidence is not observed: 1 - P(E).' };
    case 'post_h':
      return { title: 'Posterior P(H|E)', body: 'Green posterior mass: updated belief after seeing the evidence.' };
    case 'post_false':
      return { title: 'Posterior P(False|E)', body: 'Red posterior mass: updated complement after seeing the evidence.' };
    default:
      return { title: 'Hover a segment', body: 'Hover a bar segment or the dashed gate outline.' };
  }
}

function shouldHighlightToken(focus: HoverFocus, token: 'bf' | 'pe_h' | 'pe_false' | 'pe' | 'prior' | 'posterior') {
  if (!focus) return false;
  switch (token) {
    case 'bf':
      return focus === 'gate_wh' || focus === 'gate_wfalse';
    case 'pe_h':
      return focus === 'gate_wh';
    case 'pe_false':
      return focus === 'gate_wfalse';
    case 'pe':
      return focus === 'gate_pe' || focus === 'discard' || focus === 'post_h' || focus === 'post_false';
    case 'prior':
      return focus === 'prior_h' || focus === 'prior_false' || focus === 'gate_wh' || focus === 'gate_wfalse';
    case 'posterior':
      return focus === 'post_h' || focus === 'post_false';
    default:
      return false;
  }
}

function buildDots(countSignal: number, countNoise: number, signalActive: number, noiseActive: number) {
  const dots: { kind: DotKind; active: boolean }[] = [];
  for (let i = 0; i < countSignal; i += 1) dots.push({ kind: 'signal', active: i < signalActive });
  for (let i = 0; i < countNoise; i += 1) dots.push({ kind: 'noise', active: i < noiseActive });
  while (dots.length < 100) dots.push({ kind: 'noise', active: false });
  return dots.slice(0, 100);
}

function HundredScenariosView({
  pH,
  pEGivenH,
  pEGivenFalse,
  posteriorH,
}: {
  pH: number;
  pEGivenH: number;
  pEGivenFalse: number;
  posteriorH: number;
}) {
  const priorSignal = Math.max(0, Math.min(100, Math.round(pH * 100)));
  const priorNoise = 100 - priorSignal;

  const surviveSignal = Math.max(0, Math.min(priorSignal, Math.round(priorSignal * pEGivenH)));
  const surviveNoise = Math.max(0, Math.min(priorNoise, Math.round(priorNoise * pEGivenFalse)));
  const surviveTotal = surviveSignal + surviveNoise;

  const posteriorSignal = Math.max(0, Math.min(100, Math.round(posteriorH * 100)));
  const posteriorNoise = 100 - posteriorSignal;

  const priorDots = buildDots(priorSignal, priorNoise, priorSignal, priorNoise);
  const filteredDots = buildDots(priorSignal, priorNoise, surviveSignal, surviveNoise);
  const posteriorDots = buildDots(posteriorSignal, posteriorNoise, posteriorSignal, posteriorNoise);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-2">
        <DotGrid dots={priorDots} />
        <div className="text-[11px] text-gray-500 flex justify-between">
          <span>Signal</span>
          <span className="data-value text-gray-700">{priorSignal}/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <DotGrid dots={filteredDots} />
        <div className="text-[11px] text-gray-500 flex justify-between">
          <span>Survive evidence</span>
          <span className="data-value text-gray-700">{surviveTotal}/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <DotGrid dots={posteriorDots} />
        <div className="text-[11px] text-gray-500 flex justify-between">
          <span>Signal</span>
          <span className="data-value text-gray-700">{posteriorSignal}/100</span>
        </div>
      </div>
    </div>
  );
}

export function MathNotebook({
  currentProbability,
  draftLikelihoodIfTrue,
  draftLikelihoodIfFalse,
  evidenceCount,
}: MathNotebookProps) {
  const [vizMode, setVizMode] = useState<'prob' | 'scenarios'>('prob');
  const [hoverFocus, setHoverFocus] = useState<HoverFocus>(null);

  const bayes = useMemo(() => {
    const pH = clamp01(currentProbability);
    const pNotH = clamp01(1 - pH);

    const pEGivenH = clamp01(draftLikelihoodIfTrue);
    const pEGivenNotH = clamp01(draftLikelihoodIfFalse);

    const wH = pH * pEGivenH;
    const wNotH = pNotH * pEGivenNotH;
    const pE = wH + wNotH;

    const posteriorH = pE > 0 ? wH / pE : pH;
    const posteriorNotH = 1 - posteriorH;

    const eps = 1e-6;
    const bf = pEGivenH / Math.max(eps, pEGivenNotH);

    return {
      pH,
      pNotH,
      pEGivenH,
      pEGivenNotH,
      wH,
      wNotH,
      pE,
      posteriorH,
      posteriorNotH,
      bf,
    };
  }, [currentProbability, draftLikelihoodIfFalse, draftLikelihoodIfTrue]);

  const bfInterpretation = interpretBf(bayes.bf);
  const delta = bayes.posteriorH - bayes.pH;
  const deltaPts = delta * 100;
  const deltaText = `${deltaPts >= 0 ? '+' : ''}${deltaPts.toFixed(1)} pts`;
  const deltaClass = deltaPts >= 0 ? 'text-emerald-700' : 'text-rose-700';

  return (
    <aside className="md:sticky md:top-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Math Notebook
          </p>
          <h2 className="text-lg font-semibold text-gray-900">Bayes Preview</h2>
          <p className="text-xs text-gray-500 mt-1">
            One piece of evidence applied to your current belief.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold text-center">
              Evidence Likelihoods (from sliders)
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <LatexFormula className={`text-xl text-gray-700 ${focusHighlightClass(shouldHighlightToken(hoverFocus, 'bf'))}`}>
                  BF
                </LatexFormula>
                <Tip title="Bayes Factor: how many times more likely this evidence is if the thesis is true vs false. It multiplies your odds." />
              </span>
              <span className="text-gray-400">=</span>
              <Fraction
                className="text-center"
                numerator={
                  <div className="flex items-baseline gap-2">
                    <span className="inline-flex items-center gap-2">
                      <LatexFormula className={`text-lg text-gray-700 ${focusHighlightClass(shouldHighlightToken(hoverFocus, 'pe_h'))}`}>
                        P(E|H)
                      </LatexFormula>
                      <Tip title="If your thesis is true, probability of seeing this evidence." />
                    </span>
                    <span className="text-3xl font-bold text-emerald-700 data-value">
                      {formatPercent(bayes.pEGivenH, 0)}
                    </span>
                  </div>
                }
                denominator={
                  <div className="flex items-baseline gap-2">
                    <span className="inline-flex items-center gap-2">
                      <LatexFormula className={`text-lg text-gray-700 ${focusHighlightClass(shouldHighlightToken(hoverFocus, 'pe_false'))}`}>
                        P(E|False)
                      </LatexFormula>
                      <Tip title="If your thesis is false, probability of seeing this evidence anyway." />
                    </span>
                    <span className="text-3xl font-bold text-rose-700 data-value">
                      {formatPercent(bayes.pEGivenNotH, 0)}
                    </span>
                  </div>
                }
              />
              <span className="text-gray-400">=</span>
              <span className="text-4xl font-bold text-gray-900 data-value">
                {formatBf(bayes.bf)}
              </span>
              <span className={`text-sm font-semibold ${bfInterpretation.className}`}>
                {bfInterpretation.label}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="text-center md:text-left">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Prior
                </div>
                <div className={`text-2xl font-bold text-emerald-700 data-value ${focusHighlightClass(shouldHighlightToken(hoverFocus, 'prior'))}`}>
                  {formatPercent(bayes.pH, 1)}
                </div>
                <div className="text-[11px] text-gray-500">
                  {evidenceCount} evidence item{evidenceCount !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white ${deltaClass}`}
                  title="Conviction delta (posterior minus prior), in percentage points."
                >
                  <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-600">
                    Delta
                  </span>
                  <span className="text-sm font-bold data-value">{deltaText}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Driven by <span className="data-value text-gray-800">{formatBf(bayes.bf)}</span> signal
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Posterior Preview
                </div>
                <div className={`text-2xl font-bold text-emerald-800 data-value ${focusHighlightClass(shouldHighlightToken(hoverFocus, 'posterior'))}`}>
                  {formatPercent(bayes.posteriorH, 1)}
                </div>
                <div className="text-[11px] text-gray-500">
                  If you add this evidence next
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700 text-center leading-snug">
              This evidence is{' '}
              <span className="font-bold data-value text-gray-900">{formatBf(bayes.bf)}</span> more likely if your thesis is{' '}
              <span className="font-semibold text-emerald-800">true</span> than if it is{' '}
              <span className="font-semibold text-rose-800">false</span>.
              <span className={`ml-2 text-xs font-semibold ${bfInterpretation.className}`}>
                ({bfInterpretation.label})
              </span>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-500 text-center leading-snug">
              (Prior x P(E|H)) /{' '}
              <span className={focusHighlightClass(shouldHighlightToken(hoverFocus, 'pe'))}>
                P(Evidence)
              </span>{' '}
              = Posterior{' '}
              <span className="inline-block align-middle ml-1">
                <Tip title="P(Evidence) is the total chance of seeing this evidence under your current belief: P(E)=P(H)P(E|H)+P(False)P(E|False)." />
              </span>
              <div className="data-value text-sm text-gray-700 mt-1">
                ({bayes.pH.toFixed(3)} x {bayes.pEGivenH.toFixed(3)}) / {bayes.pE.toFixed(3)} ={' '}
                {bayes.posteriorH.toFixed(3)}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-end mb-2">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setVizMode('prob')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    vizMode === 'prob' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-pressed={vizMode === 'prob'}
                >
                  Probability View
                </button>
                <button
                  type="button"
                  onClick={() => setVizMode('scenarios')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    vizMode === 'scenarios'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-pressed={vizMode === 'scenarios'}
                >
                  100 Scenarios View
                </button>
              </div>
            </div>

            {vizMode === 'prob' && (
              <div className="mb-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  Diagram Key
                </div>
                <div className="text-xs text-gray-700 mt-0.5">
                  <span className="font-semibold">{focusInfo(hoverFocus).title}:</span>{' '}
                  {focusInfo(hoverFocus).body}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 mb-2">
              <div>
                <div className="font-semibold text-gray-700">Prior</div>
                <div className="text-gray-500">All possibilities</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">Evidence Filter</div>
                <div className="text-gray-500">Keep what fits E</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-700">Posterior</div>
                <div className="text-gray-500">Updated belief</div>
              </div>
            </div>

            {vizMode === 'prob' ? (
              <BayesFlowDiagram
                pH={bayes.pH}
                wH={bayes.wH}
                wNotH={bayes.wNotH}
                pE={bayes.pE}
                posteriorH={bayes.posteriorH}
                hoverFocus={hoverFocus}
                onHoverFocusChange={setHoverFocus}
              />
            ) : (
              <HundredScenariosView
                pH={bayes.pH}
                pEGivenH={bayes.pEGivenH}
                pEGivenFalse={bayes.pEGivenNotH}
                posteriorH={bayes.posteriorH}
              />
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.signal }} />
                  Signal (H)
                </span>
                <span className="data-value text-gray-800">
                  {formatPercent(bayes.pH, 1)} -&gt; {formatPercent(bayes.posteriorH, 1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.noise }} />
                  Noise (False)
                </span>
                <span className="data-value text-gray-800">
                  {formatPercent(bayes.pNotH, 1)} -&gt; {formatPercent(bayes.posteriorNotH, 1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 col-span-2">
                <span className="text-gray-500">
                  Total Likelihood of Seeing this Evidence P(E)
                </span>
                <span className="data-value text-gray-800">{formatPercent(bayes.pE, 1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
