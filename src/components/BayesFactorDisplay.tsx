// Live Bayes Factor Display with animated fraction
import { motion } from 'framer-motion';
import { formatBayesFactor, interpretBayesFactor } from '../utils/bayesian';
import { BeamBalance } from './BeamBalance';
import { LatexFormula } from './LatexFormula';

interface BayesFactorDisplayProps {
  trueLikelihood: number;
  falseLikelihood: number;
  showBalance?: boolean;
}

export function BayesFactorDisplay({
  trueLikelihood,
  falseLikelihood,
  showBalance = true,
}: BayesFactorDisplayProps) {
  const bf = trueLikelihood / (falseLikelihood || 0.01); // Prevent division by zero
  const interpretation = interpretBayesFactor(bf);

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      {/* The Formula */}
      <div className="flex items-center justify-center gap-3 text-lg mb-4">
        <LatexFormula className="text-gray-500">Bayes Factor</LatexFormula>
        <span className="text-gray-400">=</span>

        {/* The Fraction with Live Values */}
        <div className="flex flex-col items-center">
          {/* Numerator (Green - True) */}
          <motion.span
            key={`true-${trueLikelihood}`}
            initial={{ opacity: 0.5, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-emerald-600 font-bold text-xl data-value px-2"
          >
            {trueLikelihood.toFixed(2)}
          </motion.span>

          {/* Fraction bar */}
          <div className="border-t-2 border-gray-400 w-full my-0.5"></div>

          {/* Denominator (Red - False) */}
          <motion.span
            key={`false-${falseLikelihood}`}
            initial={{ opacity: 0.5, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-rose-600 font-bold text-xl data-value px-2"
          >
            {falseLikelihood.toFixed(2)}
          </motion.span>
        </div>

        <span className="text-gray-400">=</span>

        {/* The Result (Big & Bold with Pulse) */}
        <motion.span
          key={`bf-${bf}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-900 data-value"
        >
          {formatBayesFactor(bf)}
        </motion.span>
      </div>

      {/* Educational subtitle */}
      <div className="text-xs text-gray-500 text-center mb-3">
        <LatexFormula>P(Evidence | True) / P(Evidence | False)</LatexFormula>
      </div>

      {/* Interpretation */}
      <div className={`text-sm font-semibold text-center mb-3 ${interpretation.color}`}>
        {interpretation.text}
      </div>

      {/* Beam Balance Visualizer */}
      {showBalance && <BeamBalance bayesFactor={bf} />}
    </div>
  );
}
