import { NextResponse } from 'next/server';
import { z } from 'zod';

import { playGraph } from '@/lib/graph';
import { placePlayers } from '@/lib/formations';
import { getRoster } from '@/lib/players';

const requestSchema = z.object({
  playText: z.string().min(3, 'Descreva a jogada com mais detalhes.'),
  team: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requisição inválida' }, { status: 400 });
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
    });

    if (!result.analysis) {
      throw new Error('A IA não retornou uma análise.');
    }

    return NextResponse.json(result.analysis);
  } catch (error) {
    console.error('Falha ao analisar jogada:', error);
    return NextResponse.json({ error: 'Não foi possível analisar a jogada agora.' }, { status: 502 });
  }
}
