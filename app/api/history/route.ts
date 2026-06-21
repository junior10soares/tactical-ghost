import { NextResponse } from 'next/server';

import { listPlays } from '@/lib/db';

export async function GET() {
  try {
    const plays = await listPlays();
    return NextResponse.json(plays);
  } catch (error) {
    console.error('Falha ao listar histórico:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o histórico agora.' }, { status: 502 });
  }
}
