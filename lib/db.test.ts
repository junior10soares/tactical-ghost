import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnalyzeResponse } from '@/types';

const executeMock = vi.fn();

vi.mock('@libsql/client', () => ({
  createClient: () => ({ execute: executeMock }),
}));

const fakeAnalysis: AnalyzeResponse = {
  resumo: 'Resumo de teste',
  tipo: 'cruzamento',
  eficacia: 65,
  desafioSuperado: null,
  steps: [
    {
      label: 'Passo',
      descricao: 'Descrição',
      playerMove: { role: 'att', label: 'A1', fromX: 0, fromY: 0, toX: 1, toY: 1 },
      ballMove: { fromX: 0, fromY: 0, toX: 1, toY: 1 },
      sfx: null,
    },
  ],
  analise: 'Análise de teste',
};

describe('savePlay', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('inserts the play with the analysis fields serialized', async () => {
    executeMock.mockResolvedValue({ lastInsertRowid: BigInt(42) });
    const { savePlay } = await import('./db');

    const id = await savePlay({
      team: 'brasil',
      formation: '4-3-3',
      inputText: 'jogada de teste',
      analysis: fakeAnalysis,
    });

    expect(id).toBe(42);
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining(['brasil', '4-3-3', 'jogada de teste', 'cruzamento', 65]),
      }),
    );
  });
});

describe('listPlays', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('maps database rows into PlayHistoryItem objects', async () => {
    executeMock.mockResolvedValue({
      rows: [
        {
          id: 1,
          created_at: '2026-06-20 12:00:00',
          team: 'brasil',
          formation: '4-3-3',
          input_text: 'jogada de teste',
          play_type: 'cruzamento',
          efficacy: 65,
          summary: 'Resumo de teste',
        },
      ],
    });
    const { listPlays } = await import('./db');

    const result = await listPlays();
    expect(result).toEqual([
      {
        id: 1,
        createdAt: '2026-06-20 12:00:00',
        team: 'brasil',
        formation: '4-3-3',
        inputText: 'jogada de teste',
        playType: 'cruzamento',
        efficacy: 65,
        summary: 'Resumo de teste',
      },
    ]);
  });
});
