'use client';

import type { Step } from '@/types';

interface TimelineProps {
  steps: Step[];
  currentIndex: number;
  onChange: (index: number) => void;
}

export default function Timeline({ steps, currentIndex, onChange }: TimelineProps) {
  const step = steps[currentIndex];

  return (
    <div className="flex w-full max-w-[660px] flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="rounded-md bg-neutral-800 px-3 py-1 text-sm disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="text-sm text-neutral-400">
          Passo {currentIndex + 1} de {steps.length} — {step.label}
        </span>
        <button
          onClick={() => onChange(Math.min(steps.length - 1, currentIndex + 1))}
          disabled={currentIndex === steps.length - 1}
          className="rounded-md bg-neutral-800 px-3 py-1 text-sm disabled:opacity-40"
        >
          Próximo →
        </button>
      </div>
      <p className="text-sm text-neutral-300">{step.descricao}</p>
    </div>
  );
}
