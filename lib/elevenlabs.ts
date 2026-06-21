import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

let client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
  if (!client) {
    client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  }
  return client;
}

/**
 * Gera o áudio da narração usando uma voz "premade" da conta ElevenLabs
 * (plano Free). Vozes da Voice Library são bloqueadas via API no plano Free
 * mesmo quando salvas na conta — ver nota em CLAUDE.md/.env.example.
 */
export async function generateNarration(text: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_NARRATOR_VOICE_ID;
  if (!voiceId) {
    throw new Error('ELEVENLABS_NARRATOR_VOICE_ID não configurado');
  }

  const audioStream = await getClient().textToSpeech.convert(voiceId, {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const reader = audioStream.getReader();
  const chunks: Buffer[] = [];
  for (let result = await reader.read(); !result.done; result = await reader.read()) {
    chunks.push(Buffer.from(result.value));
  }
  return Buffer.concat(chunks);
}
