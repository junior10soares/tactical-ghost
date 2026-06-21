import Groq from 'groq-sdk';
import { z } from 'zod';

import { analyzeResponseSchema } from './schemas';
import type { AnalyzeResponse, ChallengeScenario, FieldPlayer, FormationName } from '@/types';

// gpt-oss-120b é o modelo gratuito da Groq com suporte a JSON Schema estrito
// (response_format: json_schema, strict: true) — necessário porque modelos de
// texto livre como o llama-3.3-70b-versatile não seguem o schema documentado de
// forma confiável (inventam campos próprios em vez de resumo/tipo/steps/etc.).
// Ver https://console.groq.com/docs/structured-outputs#supported-models
const GROQ_MODEL = 'openai/gpt-oss-120b';

const ANALYZE_RESPONSE_JSON_SCHEMA = z.toJSONSchema(analyzeResponseSchema);

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export function buildSystemPrompt(
  formation: FormationName,
  currentPlayers: FieldPlayer[],
  challenge?: ChallengeScenario,
): string {
  const challengeBlock = challenge
    ? `\nModo Desafio do Técnico ativo: "${challenge.title}". ${challenge.description}\nDefesa adversária (retranca) posicionada em: ${JSON.stringify(challenge.defenders)}\nJulgue se a ação descrita rompe essa retranca e defina o campo booleano 'desafioSuperado' (true se a jogada criou uma chance real de gol contra essa marcação, false caso contrário).\n`
    : "\nNão há Modo Desafio ativo nesta jogada — defina o campo 'desafioSuperado' como null.\n";

  return `Você é um analista tático de futebol e engenheiro de sonoplastia de alto nível.
Analise jogadas em português e retorne APENAS JSON válido, seguindo exatamente o schema fornecido.

Campo: 660x380px. Gol adversário no topo (y=20). Gol próprio na base (y=360).
Formação atual: ${formation}
Jogadores em campo: ${JSON.stringify(currentPlayers)}
${challengeBlock}
Injete gatilhos precisos de 'sfx' no milissegundo em que a ação física ocorre. Valores permitidos: "corrida_acelerada", "chute_seco", "passe_rasteiro", "cruzamento", "defesa_goleiro", "gol_torcida", "apito_juiz", null.

Gere de 3-6 steps por jogada. Escreva o campo 'analise' simulando a entonação emocionante e os jargões do ritmo clássico das transmissões esportivas brasileiras.`;
}

/** Extrai o primeiro bloco JSON de uma resposta que pode conter markdown/texto espúrio. */
export function extractJson(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Nenhum JSON encontrado na resposta da IA');
  }
  return match[0];
}

export function parseAnalyzeResponse(raw: string): AnalyzeResponse {
  const json = extractJson(raw);
  const parsed = JSON.parse(json);
  return analyzeResponseSchema.parse(parsed) as AnalyzeResponse;
}

export async function analyzePlay(
  playText: string,
  formation: FormationName,
  currentPlayers: FieldPlayer[],
  challenge?: ChallengeScenario,
): Promise<AnalyzeResponse> {
  const completion = await getClient().chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.7,
    messages: [
      { role: 'system', content: buildSystemPrompt(formation, currentPlayers, challenge) },
      { role: 'user', content: playText },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'analyze_response', schema: ANALYZE_RESPONSE_JSON_SCHEMA, strict: true },
    },
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  return parseAnalyzeResponse(raw);
}
