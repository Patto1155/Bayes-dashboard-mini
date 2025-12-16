import { useMemo } from 'react';
import { Mafs, Polygon } from 'mafs';
import { formatPercent } from '../utils/bayesian';

interface MathNotebookProps {
  currentProbability: number;
  draftLikelihoodIfTrue: number;
  draftLikelihoodIfFalse: number;
  evidenceCount: number;
}

type Segment = {
  value: number;
  color: string;
};

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

function SquareStack({
  segments,
  total = 1,
}: {
  segments: Segment[];
  total?: number;
}) {
  const left = 0.18;
  const right = 0.82;
  const bottom = 0.1;
  const top = 0.9;
  const height = top - bottom;

  const clampedTotal = clamp01(total);
  let y = bottom;

  return (
    <Mafs
      height={120}
      pan={false}
      zoom={false}
      preserveAspectRatio={false}
      viewBox={{ x: [0, 1], y: [0, 1] }}
    >
      <Polygon
        points={[
          [left, bottom],
          [right, bottom],
          [right, top],
          [left, top],
        ]}
        color={COLORS.bg}
        fillOpacity={0.35}
        strokeOpacity={0}
      />

      {segments.map((segment, i) => {
        const segmentHeight = clamp01(segment.value) * height;
        const y0 = y;
        const y1 = y + segmentHeight;
        y = y1;

        return (
          <Polygon
            key={i}
            points={[
              [left, y0],
              [right, y0],
              [right, y1],
              [left, y1],
            ]}
            color={segment.color}
            fillOpacity={1}
            strokeOpacity={0}
          />
        );
      })}

      {/* Empty remainder (evidence stage) */}
      {clampedTotal < 1 && (
        <Polygon
          points={[
            [left, bottom + clampedTotal * height],
            [right, bottom + clampedTotal * height],
            [right, top],
            [left, top],
          ]}
          color="#ffffff"
          fillOpacity={0.75}
          strokeOpacity={0}
        />
      )}

      <Polygon
        points={[
          [left, bottom],
          [right, bottom],
          [right, top],
          [left, top],
        ]}
        color={COLORS.outline}
        fillOpacity={0}
        strokeOpacity={1}
        weight={2}
      />
    </Mafs>
  );
}

function LegendRow({
  pH,
  pNotH,
}: {
  pH: number;
  pNotH: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-gray-600">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: COLORS.h }}
        />
        <span>H</span>
        <span className="data-value text-gray-800">{formatPercent(pH, 1)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: COLORS.notH }}
        />
        <span>¬H</span>
        <span className="data-value text-gray-800">{formatPercent(pNotH, 1)}</span>
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

  return (
    <aside className="md:sticky md:top-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Math Notebook
          </p>
          <h2 className="text-lg font-semibold text-gray-900">Bayes Preview</h2>
          <p className="text-xs text-gray-500 mt-1">
            Uses your current conviction as the prior for the next evidence.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                Current Conviction
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
                {bayes.bf === Infinity ? '∞' : `${bayes.bf.toFixed(2)}×`}
              </div>
              <div className="text-[11px] text-gray-500">
                P(E|H) {formatPercent(bayes.pEGivenH, 0)} · P(E|¬H) {formatPercent(bayes.pEGivenNotH, 0)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-700">Prior</div>
              <div className="text-[11px] text-gray-500 mb-2">All possibilities</div>
              <SquareStack
                segments={[
                  { value: bayes.pNotH, color: COLORS.notH },
                  { value: bayes.pH, color: COLORS.h },
                ]}
              />
              <LegendRow pH={bayes.pH} pNotH={bayes.pNotH} />
            </div>

            <div className="border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-700">Evidence</div>
              <div className="text-[11px] text-gray-500 mb-2">Weights that survive</div>
              <SquareStack
                total={bayes.pE}
                segments={[
                  { value: bayes.wNotH, color: COLORS.notH },
                  { value: bayes.wH, color: COLORS.h },
                ]}
              />
              <div className="text-[11px] text-gray-600 flex items-center justify-between">
                <span>P(E) total</span>
                <span className="data-value text-gray-800">{formatPercent(bayes.pE, 1)}</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-700">Posterior</div>
              <div className="text-[11px] text-gray-500 mb-2">Updated belief</div>
              <SquareStack
                segments={[
                  { value: bayes.posteriorNotH, color: COLORS.notH },
                  { value: bayes.posteriorH, color: COLORS.h },
                ]}
              />
              <LegendRow pH={bayes.posteriorH} pNotH={bayes.posteriorNotH} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
