import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnalyzeResponse } from '@/types';

const analyzePlayMock = vi.fn<(playText: string, formation: string, currentPlayers: unknown[]) => Promise<AnalyzeResponse>>();
const savePlayMock = vi.fn().mockResolvedValue(99);

vi.mock('./llm', () => ({
  analyzePlay: (...args: [string, string, unknown[]]) => analyzePlayMock(...args),
}));

vi.mock('./db', () => ({
  savePlay: (...args: unknown[]) => savePlayMock(...args),
}));

const fakeAnalysis: AnalyzeResponse = {
  resumo: 'Jogada de teste',
  tipo: 'cruzamento',
  eficacia: 80,
  desafioSuperado: null,
  steps: [
    {
      label: 'Passo único',
      descricao: 'Descrição de teste',
      playerMove: { role: 'att', label: 'A1', fromX: 0, fromY: 0, toX: 1, toY: 1 },
      ballMove: { fromX: 0, fromY: 0, toX: 1, toY: 1 },
      sfx: null,
    },
  ],
  analise: 'Análise de teste',
};

describe('playGraph', () => {
  beforeEach(() => {
    analyzePlayMock.mockReset();
    analyzePlayMock.mockResolvedValue(fakeAnalysis);
    savePlayMock.mockClear();
  });

  it('runs analyze -> persist and stores the result + playId in the graph state', async () => {
    const { playGraph } = await import('./graph');

    const result = await playGraph.invoke({
      playText: 'Vinicius arrancou pela esquerda',
      team: 'brasil',
      formation: '4-3-3',
      currentPlayers: [],
    });

    expect(analyzePlayMock).toHaveBeenCalledWith('Vinicius arrancou pela esquerda', '4-3-3', [], undefined);
    expect(result.analysis).toEqual(fakeAnalysis);
    expect(savePlayMock).toHaveBeenCalledWith({
      team: 'brasil',
      formation: '4-3-3',
      inputText: 'Vinicius arrancou pela esquerda',
      analysis: fakeAnalysis,
    });
    expect(result.playId).toBe(99);
  });

  it('still returns the analysis even if persisting fails', async () => {
    savePlayMock.mockRejectedValueOnce(new Error('db indisponível'));
    const { playGraph } = await import('./graph');

    const result = await playGraph.invoke({
      playText: 'jogada qualquer',
      team: 'brasil',
      formation: '4-3-3',
      currentPlayers: [],
    });

    expect(result.analysis).toEqual(fakeAnalysis);
    expect(result.playId).toBeUndefined();
  });

  it('forwards the active challenge to analyzePlay when in Desafio do Técnico mode', async () => {
    const { playGraph } = await import('./graph');
    const challenge = {
      id: 'franca-retranca',
      title: 'Retranca da França',
      description: 'desc',
      adversary: 'frança',
      defenders: [{ label: 'D1', x: 200, y: 300 }],
    };

    await playGraph.invoke({
      playText: 'jogada de desafio',
      team: 'brasil',
      formation: '4-3-3',
      currentPlayers: [],
      challenge,
    });

    expect(analyzePlayMock).toHaveBeenCalledWith('jogada de desafio', '4-3-3', [], challenge);
  });
});
