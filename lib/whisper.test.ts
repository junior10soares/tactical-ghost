import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('groq-sdk', () => ({
  default: class {
    audio = { transcriptions: { create: createMock } };
  },
  toFile: vi.fn(async (buffer: Buffer, filename: string) => ({ buffer, filename })),
}));

describe('transcribeAudio', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns the trimmed transcription text from Groq Whisper', async () => {
    createMock.mockResolvedValue({ text: '  Vinicius arrancou pela esquerda  ' });
    const { transcribeAudio } = await import('./whisper');

    const text = await transcribeAudio(Buffer.from('fake-audio'));
    expect(text).toBe('Vinicius arrancou pela esquerda');
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'whisper-large-v3', language: 'pt' }),
    );
  });
});
