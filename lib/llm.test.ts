import { describe, expect, it } from 'vitest';

import { buildSystemPrompt, extractJson, parseAnalyzeResponse } from './llm';
import type { FieldPlayer } from '@/types';

const validResponse = {
  resumo: 'Contra-ataque rápido pela esquerda com finalização no canto',
  tipo: 'contra-ataque',
  eficacia: 78,
  desafioSuperado: null,
  steps: [
    {
      label: 'Interceptação',
      descricao: 'Casemiro recupera a bola no meio-campo',
      playerMove: { role: 'mid', label: 'Casemiro', fromX: 330, fromY: 190, toX: 280, toY: 175 },
      ballMove: { fromX: 310, fromY: 180, toX: 280, toY: 175 },
      sfx: 'apito_juiz',
    },
  ],
  analise: 'Olha o contra-ataque do Brasil!',
};

describe('extractJson', () => {
  it('extracts a clean JSON object as-is', () => {
    const raw = JSON.stringify(validResponse);
    expect(JSON.parse(extractJson(raw))).toEqual(validResponse);
  });

  it('strips markdown fences and stray text around the JSON block', () => {
    const raw = `Aqui está a análise:\n\`\`\`json\n${JSON.stringify(validResponse)}\n\`\`\`\nEspero que ajude!`;
    expect(JSON.parse(extractJson(raw))).toEqual(validResponse);
  });

  it('throws when there is no JSON object in the response', () => {
    expect(() => extractJson('desculpe, não consegui analisar')).toThrow();
  });
});

describe('parseAnalyzeResponse', () => {
  it('parses and validates a well-formed Groq response', () => {
    const result = parseAnalyzeResponse(JSON.stringify(validResponse));
    expect(result.tipo).toBe('contra-ataque');
    expect(result.steps).toHaveLength(1);
  });

  it('rejects a response with an invalid play type', () => {
    const invalid = { ...validResponse, tipo: 'gol-olímpico' };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });

  it('rejects a response missing required fields', () => {
    const invalid = { ...validResponse, steps: [] };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });
});

describe('buildSystemPrompt', () => {
  it('includes the formation and the current players as JSON context', () => {
    const players: FieldPlayer[] = [
      { name: 'Casemiro', fullName: 'Carlos Henrique Casimiro', number: 5, position: 'mid', photoUrl: 'https://example.com/casemiro.jpg', label: 'M1', x: 330, y: 190 },
    ];

    const prompt = buildSystemPrompt('4-3-3', players);
    expect(prompt).toContain('4-3-3');
    expect(prompt).toContain('Casemiro');
    expect(prompt).toContain('APENAS JSON válido');
  });

  it('includes the challenge context and the desafioSuperado instruction when a challenge is active', () => {
    const prompt = buildSystemPrompt('4-3-3', [], {
      id: 'franca-retranca',
      title: 'Retranca da França',
      description: 'Defesa compacta recuada.',
      adversary: 'frança',
      defenders: [{ label: 'D1', x: 200, y: 300 }],
    });

    expect(prompt).toContain('Modo Desafio do Técnico ativo');
    expect(prompt).toContain('Retranca da França');
    expect(prompt).toContain("'desafioSuperado'");
  });

  it('omits the challenge block when no challenge is given', () => {
    const prompt = buildSystemPrompt('4-3-3', []);
    expect(prompt).not.toContain('Modo Desafio do Técnico ativo');
  });
});
