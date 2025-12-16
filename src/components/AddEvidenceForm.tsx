import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';

interface AddEvidenceFormProps {
  onAdd: (evidence: {
    summary: string;
    sourceUrl: string;
    likelihoodIfTrue: number;
    likelihoodIfFalse: number;
  }) => void;
  likelihoodIfTrue: number;
  likelihoodIfFalse: number;
  onLikelihoodIfTrueChange: (value: number) => void;
  onLikelihoodIfFalseChange: (value: number) => void;
}

export function AddEvidenceForm({
  onAdd,
  likelihoodIfTrue,
  likelihoodIfFalse,
  onLikelihoodIfTrueChange,
  onLikelihoodIfFalseChange,
}: AddEvidenceFormProps) {
  const [summary, setSummary] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const resetForm = () => {
    setSummary('');
    setSourceUrl('');
    onLikelihoodIfTrueChange(0.7);
    onLikelihoodIfFalseChange(0.3);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!summary.trim()) {
      alert('Please provide an evidence summary');
      return;
    }

    onAdd({
      summary: summary.trim(),
      sourceUrl: sourceUrl.trim(),
      likelihoodIfTrue,
      likelihoodIfFalse,
    });

    resetForm();
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Evidence Wizard
          </p>
          <p className="text-xs text-gray-500">
            Tip: keep evidence to one clear claim
          </p>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Add Evidence</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Evidence
            </label>
            <span className="text-xs text-gray-500">
              What happened? Why it matters.
            </span>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g., Q4 revenue beat estimates by 12%"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
            required
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Source
            </label>
            <span className="text-xs text-gray-500">Optional link</span>
          </div>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <label className="block text-sm font-semibold text-emerald-700">
                If thesis true
              </label>
              <span className="text-xs text-gray-500">
                P(E|H)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={likelihoodIfTrue * 100}
                onChange={(e) => onLikelihoodIfTrueChange(Number(e.target.value) / 100)}
                className="flex-1 slider-green"
              />
              <span className="text-xl font-bold text-emerald-600 data-value w-14 text-right">
                {(likelihoodIfTrue * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>Impossible</span>
              <span>Certain</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <label className="block text-sm font-semibold text-rose-700">
                If thesis wrong
              </label>
              <span className="text-xs text-gray-500">
                P(E|¬H)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={likelihoodIfFalse * 100}
                onChange={(e) => onLikelihoodIfFalseChange(Number(e.target.value) / 100)}
                className="flex-1 slider-red"
              />
              <span className="text-xl font-bold text-rose-600 data-value w-14 text-right">
                {(likelihoodIfFalse * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>Impossible</span>
              <span>Certain</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>
    </section>
  );
}
