// Main App - Bayesian Conviction Calculator
import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Evidence, BayesianState } from './types';
import { calculateBayesFactor, updateBelief } from './utils/bayesian';
import { Header } from './components/Header';
import { EvidenceCard } from './components/EvidenceCard';
import { AddEvidenceForm } from './components/AddEvidenceForm';
import { MathNotebook } from './components/MathNotebook';
import { Footer } from './components/Footer';

function App() {
  const [state, setState] = useState<BayesianState>({
    thesis: '',
    priorProbability: 0.5,
    currentProbability: 0.5,
    evidenceList: [],
  });

  const [draftLikelihoodIfTrue, setDraftLikelihoodIfTrue] = useState(0.7);
  const [draftLikelihoodIfFalse, setDraftLikelihoodIfFalse] = useState(0.3);

  // Handle thesis change
  const handleThesisChange = (thesis: string) => {
    setState((prev: BayesianState) => ({ ...prev, thesis }));
  };

  // Handle prior probability change
  const handlePriorChange = (priorProbability: number) => {
    // Recalculate all evidence with new prior
    let currentProb = priorProbability;
    const updatedEvidence = state.evidenceList.map((evidence: Evidence) => {
      const bf = evidence.bayesFactor;
      const posteriorProb = updateBelief(currentProb, bf);
      const updatedEvidence: Evidence = {
        ...evidence,
        priorProb: currentProb,
        posteriorProb,
      };
      currentProb = posteriorProb;
      return updatedEvidence;
    });

    setState({
      ...state,
      priorProbability,
      currentProbability: currentProb,
      evidenceList: updatedEvidence,
    });
  };

  // Add new evidence
  const handleAddEvidence = (newEvidence: {
    summary: string;
    sourceUrl: string;
    likelihoodIfTrue: number;
    likelihoodIfFalse: number;
  }) => {
    const bayesFactor = calculateBayesFactor(
      newEvidence.likelihoodIfTrue,
      newEvidence.likelihoodIfFalse
    );

    const priorProb = state.currentProbability;
    const posteriorProb = updateBelief(priorProb, bayesFactor);

    const evidence: Evidence = {
      id: crypto.randomUUID(),
      summary: newEvidence.summary,
      sourceUrl: newEvidence.sourceUrl,
      likelihoodIfTrue: newEvidence.likelihoodIfTrue,
      likelihoodIfFalse: newEvidence.likelihoodIfFalse,
      bayesFactor,
      priorProb,
      posteriorProb,
      timestamp: new Date(),
    };

    setState({
      ...state,
      currentProbability: posteriorProb,
      evidenceList: [...state.evidenceList, evidence],
    });
  };

  // Delete evidence
  const handleDeleteEvidence = (id: string) => {
    const index = state.evidenceList.findIndex((e: Evidence) => e.id === id);
    if (index === -1) return;

    const newEvidenceList = state.evidenceList.filter((e: Evidence) => e.id !== id);

    // Recalculate probabilities from prior
    let currentProb = state.priorProbability;
    const updatedEvidence = newEvidenceList.map((evidence: Evidence) => {
      const posteriorProb = updateBelief(currentProb, evidence.bayesFactor);
      const updatedEvidence: Evidence = {
        ...evidence,
        priorProb: currentProb,
        posteriorProb,
      };
      currentProb = posteriorProb;
      return updatedEvidence;
    });

    setState({
      ...state,
      currentProbability: currentProb,
      evidenceList: updatedEvidence,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        thesis={state.thesis}
        onThesisChange={handleThesisChange}
        priorProbability={state.priorProbability}
        onPriorChange={handlePriorChange}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
          {/* Left column: Inputs + narrative */}
          <div className="space-y-6">
            <AddEvidenceForm
              onAdd={handleAddEvidence}
              likelihoodIfTrue={draftLikelihoodIfTrue}
              likelihoodIfFalse={draftLikelihoodIfFalse}
              onLikelihoodIfTrueChange={setDraftLikelihoodIfTrue}
              onLikelihoodIfFalseChange={setDraftLikelihoodIfFalse}
            />

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Evidence Log</h2>
                  <span className="text-sm text-gray-500">
                    ({state.evidenceList.length})
                  </span>
                </div>
              </div>

              {state.evidenceList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    No Evidence Yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add evidence above — the math preview updates live as you adjust sliders.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.evidenceList.map((evidence: Evidence, index: number) => (
                    <EvidenceCard
                      key={evidence.id}
                      evidence={evidence}
                      index={index}
                      onDelete={handleDeleteEvidence}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column: All math */}
          <MathNotebook
            currentProbability={state.currentProbability}
            draftLikelihoodIfTrue={draftLikelihoodIfTrue}
            draftLikelihoodIfFalse={draftLikelihoodIfFalse}
            evidenceCount={state.evidenceList.length}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
