import { z } from 'zod';

export const positionSchema = z.enum(['gk', 'def', 'mid', 'att']);

export const playTypeSchema = z.enum([
  'contra-ataque',
  'escanteio',
  'triangulação',
  'pressão-alta',
  'cruzamento',
  'jogada-ensaiada',
  'falta',
  'tiro-livre',
]);

export const sfxSchema = z
  .enum([
    'corrida_acelerada',
    'chute_seco',
    'passe_rasteiro',
    'cruzamento',
    'defesa_goleiro',
    'gol_torcida',
    'apito_juiz',
  ])
  .nullable();

export const playerMoveSchema = z.object({
  role: positionSchema,
  label: z.string(),
  fromX: z.number(),
  fromY: z.number(),
  toX: z.number(),
  toY: z.number(),
});

export const ballMoveSchema = z.object({
  fromX: z.number(),
  fromY: z.number(),
  toX: z.number(),
  toY: z.number(),
});

export const stepSchema = z.object({
  label: z.string(),
  descricao: z.string(),
  playerMove: playerMoveSchema,
  ballMove: ballMoveSchema,
  sfx: sfxSchema,
});

export const analyzeResponseSchema = z.object({
  resumo: z.string(),
  tipo: playTypeSchema,
  eficacia: z.number().min(0).max(100),
  // nullable (não opcional) porque o response_format json_schema em modo "strict" da Groq
  // exige que todo campo apareça em "required" — ausência condicional não é suportada.
  desafioSuperado: z.boolean().nullable(),
  steps: z.array(stepSchema).min(1).max(6),
  analise: z.string(),
});
