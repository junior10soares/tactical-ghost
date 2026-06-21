import { NextResponse } from 'next/server';
import { z } from 'zod';

import { playGraph } from '@/lib/graph';
import { placePlayers } from '@/lib/formations';
import { getChallenge, listChallenges } from '@/lib/challenges';
import { getRoster } from '@/lib/players';

export async function GET() {
  return NextResponse.json(listChallenges());
}

const requestSchema = z.object({
  challengeId: z.string(),
  playText: z.string().min(3, 'Descreva a jogada com mais detalhes.'),
  team: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requisição inválida' }, { status: 400 });
  }

  const challenge = getChallenge(parsed.data.challengeId);
  if (!challenge) {
    return NextResponse.json({ error: `Desafio "${parsed.data.challengeId}" não encontrado.` }, { status: 404 });
  }

  const roster = getRoster(parsed.data.team);
  if (!roster) {
    return NextResponse.json({ error: `Seleção "${parsed.data.team}" não encontrada.` }, { status: 404 });
  }

  try {
    const result = await playGraph.invoke({
      playText: parsed.data.playText,
      team: parsed.data.team,
      formation: roster.formation,
      currentPlayers: placePlayers(roster),
      challenge,
    });

    if (!result.analysis) {
      throw new Error('A IA não retornou uma análise.');
    }

    return NextResponse.json(result.analysis);
  } catch (error) {
    console.error('Falha ao avaliar desafio:', error);
    return NextResponse.json({ error: 'Não foi possível avaliar o desafio agora.' }, { status: 502 });
  }
}
