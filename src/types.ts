export interface Evidence {
  id: string;
  summary: string;
  sourceUrl: string;
  likelihoodIfTrue: number;
  likelihoodIfFalse: number;
  bayesFactor: number;
  priorProb: number;
  posteriorProb: number;
  timestamp: Date;
}

export interface BayesianState {
  thesis: string;
  priorProbability: number;
  currentProbability: number;
  evidenceList: Evidence[];
}
