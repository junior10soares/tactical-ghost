import Groq, { toFile } from 'groq-sdk';

const GROQ_WHISPER_MODEL = 'whisper-large-v3';

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export async function transcribeAudio(audio: Buffer, filename = 'jogada.webm'): Promise<string> {
  const transcription = await getClient().audio.transcriptions.create({
    model: GROQ_WHISPER_MODEL,
    language: 'pt',
    file: await toFile(audio, filename),
  });

  return transcription.text.trim();
}
