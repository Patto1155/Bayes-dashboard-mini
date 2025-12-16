import { useMemo } from 'react';
import { Mafs, Polygon } from 'mafs';
import { formatPercent } from '../utils/bayesian';

interface MathNotebookProps {
  currentProbability: number;
  draftLikelihoodIfTrue: number;
  draftLikelihoodIfFalse: number;
  evidenceCount: number;
}

const COLORS = {
  h: '#059669', // emerald-600
  notH: '#e11d48', // rose-600
  bg: '#e5e7eb', // gray-200
  outline: '#9ca3af', // gray-400
};

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function BayesFlowDiagram({
  pH,
  wH,
  wNotH,
  pE,
  posteriorH,
}: {
  pH: number;
  wH: number;
  wNotH: number;
  pE: number;
  posteriorH: number;
}) {
  // Coordinate system: x in [0, 3], y in [0, 1]
  const xPrior0 = 0.25;
  const xPrior1 = 0.45;
  const xGate0 = 1.42;
  const xGate1 = 1.58;
  const xPost0 = 2.55;
  const xPost1 = 2.75;

  const priorNotH = clamp01(1 - pH);
  const priorH0 = priorNotH;
  const priorH1 = 1;

  const gateNotH0 = 0;
  const gateNotH1 = clamp01(wNotH);
  const gateH0 = gateNotH1;
  const gateH1 = clamp01(wNotH + wH); // equals pE

  const posteriorNotH = clamp01(1 - posteriorH);
  const postNotH0 = 0;
  const postNotH1 = posteriorNotH;
  const postH0 = postNotH1;
  const postH1 = 1;

  const flowOpacity = 0.22;

  return (
    <Mafs
      height={220}
      pan={false}
      zoom={false}
      preserveAspectRatio={false}
      viewBox={{ x: [0, 3], y: [0, 1] }}
    >
      {/* Flow ribbons (prior → gate) */}
      <Polygon
        points={[
          [xPrior1, 0],
          [xGate0, gateNotH0],
          [xGate0, gateNotH1],
          [xPrior1, priorNotH],
        ]}
        color={COLORS.notH}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xPrior1, priorNotH],
          [xGate0, gateH0],
          [xGate0, gateH1],
          [xPrior1, priorH1],
        ]}
        color={COLORS.h}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />

      {/* Flow ribbons (gate → posterior) */}
      <Polygon
        points={[
          [xGate1, gateNotH0],
          [xPost0, postNotH0],
          [xPost0, postNotH1],
          [xGate1, gateNotH1],
        ]}
        color={COLORS.notH}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xGate1, gateH0],
          [xPost0, postH0],
          [xPost0, postH1],
          [xGate1, gateH1],
        ]}
        color={COLORS.h}
        fillOpacity={flowOpacity}
        strokeOpacity={0}
      />

      {/* Prior bar */}
      <Polygon
        points={[
          [xPrior0, 0],
          [xPrior1, 0],
          [xPrior1, priorNotH],
          [xPrior0, priorNotH],
        ]}
        color={COLORS.notH}
        fillOpacity={1}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xPrior0, priorH0],
          [xPrior1, priorH0],
          [xPrior1, priorH1],
          [xPrior0, priorH1],
        ]}
        color={COLORS.h}
        fillOpacity={1}
        strokeOpacity={0}
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
          [xGate1, gateNotH1],
          [xGate0, gateNotH1],
        ]}
        color={COLORS.notH}
        fillOpacity={1}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xGate0, gateH0],
          [xGate1, gateH0],
          [xGate1, gateH1],
          [xGate0, gateH1],
        ]}
        color={COLORS.h}
        fillOpacity={1}
        strokeOpacity={0}
      />
      {/* Discarded mass (evidence not observed) */}
      {pE < 1 && (
        <Polygon
          points={[
            [xGate0, gateH1],
            [xGate1, gateH1],
            [xGate1, 1],
            [xGate0, 1],
          ]}
          color={COLORS.bg}
          fillOpacity={0.85}
          strokeOpacity={0}
        />
      )}
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
          [xPost0, postNotH0],
          [xPost1, postNotH0],
          [xPost1, postNotH1],
          [xPost0, postNotH1],
        ]}
        color={COLORS.notH}
        fillOpacity={1}
        strokeOpacity={0}
      />
      <Polygon
        points={[
          [xPost0, postH0],
          [xPost1, postH0],
          [xPost1, postH1],
          [xPost0, postH1],
        ]}
        color={COLORS.h}
        fillOpacity={1}
        strokeOpacity={0}
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

export function MathNotebook({
  currentProbability,
  draftLikelihoodIfTrue,
  draftLikelihoodIfFalse,
  evidenceCount,
}: MathNotebookProps) {
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

  const notSymbol = '\u00AC';

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
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                Current Conviction (Prior)
              </div>
              <div className="text-2xl font-bold text-emerald-700 data-value">
                {formatPercent(bayes.pH, 1)}
              </div>
              <div className="text-[11px] text-gray-500">
                {evidenceCount} evidence item{evidenceCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                Bayes Factor
              </div>
              <div className="text-2xl font-bold text-gray-900 data-value">
                {bayes.bf === Infinity ? '∞' : `${bayes.bf.toFixed(2)}x`}
              </div>
              <div className="text-[11px] text-gray-500">
                P(E|H) {formatPercent(bayes.pEGivenH, 0)} · P(E|{notSymbol}H) {formatPercent(bayes.pEGivenNotH, 0)}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3">
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

            <BayesFlowDiagram
              pH={bayes.pH}
              wH={bayes.wH}
              wNotH={bayes.wNotH}
              pE={bayes.pE}
              posteriorH={bayes.posteriorH}
            />

            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.h }} />
                  H
                </span>
                <span className="data-value text-gray-800">
                  {formatPercent(bayes.pH, 1)} → {formatPercent(bayes.posteriorH, 1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.notH }} />
                  {notSymbol}H
                </span>
                <span className="data-value text-gray-800">
                  {formatPercent(bayes.pNotH, 1)} → {formatPercent(bayes.posteriorNotH, 1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 col-span-2">
                <span className="text-gray-500">
                  Total fit P(E) (how much survives the filter)
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

