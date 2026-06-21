'use client';

import { useRef, useState } from 'react';

import { computeStepOffsets, playSfx } from '@/lib/audioContext';
import type { Step } from '@/types';

interface AnalysisPanelProps {
  steps: Step[];
  analise: string;
  onStepChange: (index: number) => void;
}

export default function AnalysisPanel({ steps, analise, onStepChange }: AnalysisPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [narrationState, setNarrationState] = useState<'idle' | 'loading' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handlePlaySteps() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsPlaying(true);

    const offsets = computeStepOffsets(steps.length);
    offsets.forEach((offsetMs, index) => {
      const timeoutId = setTimeout(() => {
        onStepChange(index);
        playSfx(steps[index].sfx);
        if (index === steps.length - 1) setIsPlaying(false);
      }, offsetMs);
      timeoutsRef.current.push(timeoutId);
    });
  }

  async function handleNarrate() {
    setNarrationState('loading');
    try {
      const response = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: analise }),
      });
      if (!response.ok) throw new Error('Falha ao gerar narração');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current = new Audio(url);
      await audioRef.current.play();
      setNarrationState('idle');
    } catch {
      setNarrationState('error');
    }
  }

  return (
    <div className="flex w-full max-w-[660px] items-center gap-3">
      <button
        onClick={handlePlaySteps}
        disabled={isPlaying}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPlaying ? 'Reproduzindo...' : '▶ Reproduzir jogada (SFX)'}
      </button>
      <button
        onClick={handleNarrate}
        disabled={narrationState === 'loading'}
        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {narrationState === 'loading' ? 'Gerando narração...' : '🔊 Ouvir narração'}
      </button>
      {narrationState === 'error' && (
        <span className="text-xs text-red-400">Narração indisponível agora.</span>
      )}
    </div>
  );
}
