// Header with thesis input and prior slider
import { Brain } from 'lucide-react';

interface HeaderProps {
  thesis: string;
  onThesisChange: (thesis: string) => void;
  priorProbability: number;
  onPriorChange: (prior: number) => void;
}

export function Header({
  thesis,
  onThesisChange,
  priorProbability,
  onPriorChange,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">
            Bayesian Conviction Calculator
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-5 italic">
          A thinking tool for systematic investors. Quantify your beliefs using Bayes' Theorem.
        </p>

        {/* Thesis Input */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Thesis
            </label>
            <span className="text-xs text-gray-500">
              One sentence: what must be true?
            </span>
          </div>
          <input
            type="text"
            value={thesis}
            onChange={(e) => onThesisChange(e.target.value)}
            placeholder="e.g., Company XYZ grows revenue 30%+ annually for 5 years"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>

        {/* Prior Probability Slider */}
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Prior belief
            </label>
            <span className="text-xs text-gray-500">
              Starting confidence before evidence
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="99"
            value={priorProbability * 100}
            onChange={(e) => onPriorChange(Number(e.target.value) / 100)}
            className="w-full slider-gray"
          />

          <div className="flex justify-between text-[11px] text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </header>
  );
}
