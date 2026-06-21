'use client';

import { useState } from 'react';

import type { AnalyzeResponse } from '@/types';

import AudioRecorder from './AudioRecorder';

interface PlayInputProps {
  team: string;
  onAnalyzed: (result: AnalyzeResponse) => void;
}

export default function PlayInput({ team, onAnalyzed }: PlayInputProps) {
  const [playText, setPlayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playText, team }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Falha ao analisar a jogada.');
      }

      onAnalyzed(data as AnalyzeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[660px] flex-col gap-2">
      <textarea
        value={playText}
        onChange={(event) => setPlayText(event.target.value)}
        placeholder="Descreva a jogada: ex. 'Vinicius arrancou pela esquerda, driblou dois e cruzou para Rodrygo' (ou grave por voz abaixo)"
        className="min-h-20 rounded-md border border-neutral-700 bg-neutral-900 p-3 text-sm text-white placeholder:text-neutral-500"
        disabled={loading}
      />
      <div className="flex items-center justify-between gap-2">
        <AudioRecorder onTranscribed={setPlayText} />
        <button
          type="submit"
          disabled={loading || playText.trim().length < 3}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Analisando...' : 'Analisar jogada'}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
