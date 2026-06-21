'use client';

import { useRef, useState } from 'react';

interface AudioRecorderProps {
  onTranscribed: (text: string) => void;
}

export default function AudioRecorder({ onTranscribed }: AudioRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'transcribing' | 'error'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await sendAudio(new Blob(chunksRef.current, { type: 'audio/webm' }));
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('recording');
    } catch {
      setState('error');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setState('transcribing');
  }

  async function sendAudio(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'jogada.webm');

      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Falha ao transcrever');

      onTranscribed(data.text);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  if (state === 'recording') {
    return (
      <button
        type="button"
        onClick={stopRecording}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
      >
        ⏹ Parar gravação
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={state === 'transcribing'}
      className="rounded-md bg-neutral-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {state === 'transcribing' ? 'Transcrevendo...' : '🎙 Gravar jogada'}
      {state === 'error' && <span className="ml-2 text-red-400">(falhou, tente de novo)</span>}
    </button>
  );
}
