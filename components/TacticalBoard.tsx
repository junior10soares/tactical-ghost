'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { getRoster } from '@/lib/players';
import type { AnalyzeResponse, ChallengeScenario } from '@/types';

import AnalysisPanel from './AnalysisPanel';
import ChallengeMode from './ChallengeMode';
import Field2D from './Field2D';
import HistoryPanel from './HistoryPanel';
import PlayInput from './PlayInput';
import Timeline from './Timeline';

interface TacticalBoardProps {
  initialTeam: string;
}

export default function TacticalBoard({ initialTeam }: TacticalBoardProps) {
  const [mode, setMode] = useState<'livre' | 'desafio'>('livre');
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeScenario | null>(null);

  const roster = getRoster(initialTeam)!;

  function resetPlay() {
    setAnalysis(null);
    setStepIndex(0);
  }

  function handleAnalyzed(result: AnalyzeResponse) {
    setAnalysis(result);
    setStepIndex(0);
    setHistoryRefreshKey((key) => key + 1);
  }

  function handleChallengeResolved(result: AnalyzeResponse, challenge: ChallengeScenario) {
    setActiveChallenge(challenge);
    handleAnalyzed(result);
  }

  function handleModeChange(nextMode: 'livre' | 'desafio') {
    setMode(nextMode);
    resetPlay();
    if (nextMode === 'livre') setActiveChallenge(null);
  }

  const activeStep = analysis?.steps[stepIndex];
  const opponents = mode === 'desafio' ? activeChallenge?.defenders : undefined;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-[660px] items-center justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('livre')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${mode === 'livre' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
          >
            Jogada Livre
          </button>
          <button
            onClick={() => handleModeChange('desafio')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${mode === 'desafio' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
          >
            Desafio do Técnico
          </button>
        </div>
      </div>

      <Field2D roster={roster} activeStep={activeStep} opponents={opponents} />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex w-full max-w-[660px] flex-col items-center"
        >
          {mode === 'livre' ? (
            <PlayInput team={roster.team} onAnalyzed={handleAnalyzed} />
          ) : (
            <ChallengeMode
              team={roster.team}
              onResolved={handleChallengeResolved}
              onChallengeSelected={setActiveChallenge}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-[660px] flex-col gap-3"
          >
            <AnalysisPanel steps={analysis.steps} analise={analysis.analise} onStepChange={setStepIndex} />
            <Timeline steps={analysis.steps} currentIndex={stepIndex} onChange={setStepIndex} />
            <div className="rounded-md bg-neutral-900 p-3 text-sm">
              <p className="font-semibold text-emerald-400">
                {analysis.tipo} — eficácia {analysis.eficacia}%
              </p>
              {mode === 'desafio' && analysis.desafioSuperado !== null && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-1 font-semibold ${analysis.desafioSuperado ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {analysis.desafioSuperado ? '✅ Retranca rompida!' : '❌ A defesa aguentou — tente outra jogada.'}
                </motion.p>
              )}
              <p className="mt-1 text-neutral-300">{analysis.analise}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistoryPanel refreshKey={historyRefreshKey} />
    </div>
  );
}
