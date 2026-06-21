import type { SfxType } from '@/types';

/** Duração padrão de cada passo da jogada durante a reprodução automática. */
export const DEFAULT_STEP_DURATION_MS = 1200;

/** Calcula o offset (em ms, a partir do início da reprodução) de cada passo. */
export function computeStepOffsets(stepCount: number, stepDurationMs = DEFAULT_STEP_DURATION_MS): number[] {
  return Array.from({ length: stepCount }, (_, index) => index * stepDurationMs);
}

let sharedContext: AudioContext | null = null;
const sfxBufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

async function loadSfxBuffer(sfx: NonNullable<SfxType>): Promise<AudioBuffer | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const cached = sfxBufferCache.get(sfx);
  if (cached) return cached;

  try {
    const response = await fetch(`/audio/${sfx}.mp3`);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sfxBufferCache.set(sfx, audioBuffer);
    return audioBuffer;
  } catch {
    // Arquivo de SFX ausente ou corrompido — toca a jogada em silêncio em vez de quebrar.
    return null;
  }
}

/** Dispara um efeito sonoro imediatamente, sem bloquear a timeline da animação. */
export function playSfx(sfx: SfxType): void {
  if (!sfx) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  void loadSfxBuffer(sfx).then((buffer) => {
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  });
}
