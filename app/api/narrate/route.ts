import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateNarration } from '@/lib/elevenlabs';

const requestSchema = z.object({
  text: z.string().min(3, 'Texto de narração inválido.'),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requisição inválida' }, { status: 400 });
  }

  try {
    const audio = await generateNarration(parsed.data.text);
    return new NextResponse(new Uint8Array(audio), {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Falha ao gerar narração:', error);
    return NextResponse.json({ error: 'Não foi possível gerar a narração agora.' }, { status: 502 });
  }
}
