// Bayesian calculation utilities

/**
 * Convert probability to odds
 * O = P / (1 - P)
 */
export function probToOdds(prob: number): number {
  if (prob >= 1) return Infinity;
  if (prob <= 0) return 0;
  return prob / (1 - prob);
}

/**
 * Convert odds to probability
 * P = O / (1 + O)
 */
export function oddsToProb(odds: number): number {
  if (odds === Infinity) return 1;
  if (odds === 0) return 0;
  return odds / (1 + odds);
}

/**
 * Calculate Bayes Factor
 * BF = P(E|H) / P(E|¬H)
 */
export function calculateBayesFactor(
  likelihoodIfTrue: number,
  likelihoodIfFalse: number
): number {
  // Handle zero denominator - prevent division by zero
  if (likelihoodIfFalse === 0) {
    return likelihoodIfTrue > 0 ? Infinity : 1;
  }
  return likelihoodIfTrue / likelihoodIfFalse;
}

/**
 * Update belief using Bayes' Theorem (Odds Form)
 * O_new = O_prior × BayesFactor
 * P_new = O_new / (1 + O_new)
 */
export function updateBelief(
  priorProb: number,
  bayesFactor: number
): number {
  const priorOdds = probToOdds(priorProb);
  const posteriorOdds = priorOdds * bayesFactor;
  return oddsToProb(posteriorOdds);
}

/**
 * Calculate Kelly Criterion position size
 * f* = (p × b - q) / b
 * where p = probability of winning, q = 1-p, b = odds offered
 */
export function calculateKelly(
  probability: number,
  oddsOffered: number = 3
): number {
  const p = probability;
  const q = 1 - probability;
  const b = oddsOffered;
  
  const kelly = (p * b - q) / b;
  
  // Kelly can be negative (suggesting no position)
  return Math.max(0, kelly);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a Bayes Factor value
 */
export function formatBayesFactor(bf: number): string {
  if (bf === Infinity) return '∞×';
  if (bf >= 100) return `${bf.toFixed(0)}×`;
  if (bf >= 10) return `${bf.toFixed(1)}×`;
  return `${bf.toFixed(2)}×`;
}

/**
 * Get interpretation of Bayes Factor
 */
export function interpretBayesFactor(bf: number): {
  text: string;
  color: string;
} {
  if (bf > 10) return { text: 'Strong Support', color: 'text-emerald-600' };
  if (bf > 3) return { text: 'Moderate Support', color: 'text-emerald-500' };
  if (bf > 1) return { text: 'Weak Support', color: 'text-emerald-400' };
  if (bf === 1) return { text: 'Uninformative', color: 'text-gray-500' };
  if (bf > 0.33) return { text: 'Weak Contradiction', color: 'text-rose-400' };
  if (bf > 0.1) return { text: 'Moderate Contradiction', color: 'text-rose-500' };
  return { text: 'Strong Contradiction', color: 'text-rose-600' };
}
