'use client';

import { useEffect, useState } from 'react';

interface HistoryItem {
  id: number;
  createdAt: string;
  team: string;
  formation: string;
  inputText: string;
  playType: string | null;
  efficacy: number | null;
  summary: string | null;
}

interface HistoryPanelProps {
  /** Incrementar este valor força um novo fetch (ex.: após salvar uma jogada). */
  refreshKey: number;
}

export default function HistoryPanel({ refreshKey }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHistory(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return null;
  if (history.length === 0) return null;

  return (
    <div className="flex w-full max-w-[660px] flex-col gap-2">
      <h2 className="text-sm font-semibold text-neutral-400">Histórico</h2>
      <ul className="flex flex-col gap-1">
        {history.map((item) => (
          <li key={item.id} className="rounded-md bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
            <span className="font-semibold text-emerald-400">{item.playType ?? 'jogada'}</span>{' '}
            — {item.summary ?? item.inputText} ({item.efficacy ?? '?'}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
