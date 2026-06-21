'use client';

import { useEffect, useState } from 'react';

import type { AnalyzeResponse, ChallengeScenario } from '@/types';

interface ChallengeModeProps {
  team: string;
  onResolved: (result: AnalyzeResponse, challenge: ChallengeScenario) => void;
  onChallengeSelected: (challenge: ChallengeScenario | null) => void;
}

export default function ChallengeMode({ team, onResolved, onChallengeSelected }: ChallengeModeProps) {
  const [challenges, setChallenges] = useState<ChallengeScenario[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [playText, setPlayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/challenge')
      .then((res) => res.json())
      .then((data: ChallengeScenario[]) => {
        setChallenges(data);
        if (data[0]) {
          setSelectedId(data[0].id);
          onChallengeSelected(data[0]);
        }
      })
      .catch(() => setError('Não foi possível carregar os desafios.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedChallenge = challenges.find((c) => c.id === selectedId) ?? null;

  function handleSelectChange(id: string) {
    setSelectedId(id);
    onChallengeSelected(challenges.find((c) => c.id === id) ?? null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedChallenge) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: selectedChallenge.id, playText, team }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Falha ao avaliar o desafio.');

      onResolved(data as AnalyzeResponse, selectedChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[660px] flex-col gap-2">
      <select
        value={selectedId}
        onChange={(event) => handleSelectChange(event.target.value)}
        className="rounded-md border border-neutral-700 bg-neutral-900 p-2 text-sm text-white"
      >
        {challenges.map((challenge) => (
          <option key={challenge.id} value={challenge.id}>
            {challenge.title}
          </option>
        ))}
      </select>

      {selectedChallenge && <p className="text-xs text-neutral-400">{selectedChallenge.description}</p>}

      <textarea
        value={playText}
        onChange={(event) => setPlayText(event.target.value)}
        placeholder="Descreva a jogada para romper essa retranca..."
        className="min-h-20 rounded-md border border-neutral-700 bg-neutral-900 p-3 text-sm text-white placeholder:text-neutral-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || playText.trim().length < 3 || !selectedChallenge}
        className="self-end rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'Avaliando...' : 'Tentar romper a retranca'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
