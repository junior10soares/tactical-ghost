import { NextResponse } from 'next/server';

import { transcribeAudio } from '@/lib/whisper';

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const audio = formData?.get('audio');

  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Envie o áudio no campo "audio" (multipart/form-data).' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await audio.arrayBuffer());
    const text = await transcribeAudio(buffer);
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Falha ao transcrever áudio:', error);
    return NextResponse.json({ error: 'Não foi possível transcrever o áudio agora.' }, { status: 502 });
  }
}
