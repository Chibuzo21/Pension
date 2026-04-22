// lib/useVoiceEnrol.ts
"use client";

import { useState } from "react";
import { getErrorMessage } from "./errors";

const RECORD_SECONDS = 6; // slightly longer than verify for better quality
const TAKES_REQUIRED = 3;

export function useVoiceEnrol({
  onComplete,
  onError,
}: {
  onComplete: (audioList: string[]) => void;
  onError: (msg: string) => void;
}) {
  const [takes, setTakes] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(RECORD_SECONDS);

  const takesRequired = TAKES_REQUIRED;
  const currentTake = takes.length + 1;
  const done = takes.length >= TAKES_REQUIRED;

  async function recordTake() {
    if (recording || done) return;
    setRecording(true);
    setCountdown(RECORD_SECONDS);

    let secs = RECORD_SECONDS;
    const timer = setInterval(() => {
      secs--;
      setCountdown(secs);
      if (secs <= 0) clearInterval(timer);
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.start();
      await new Promise<void>((r) => setTimeout(r, RECORD_SECONDS * 1000));
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
      stream.getTracks().forEach((t) => t.stop());

      // Decode → resample → WAV → base64
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const blob = new Blob(chunks, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      await audioCtx.close();

      const offlineCtx = new OfflineAudioContext(
        1,
        Math.ceil(audioBuffer.duration * 16000),
        16000,
      );
      const src = offlineCtx.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(offlineCtx.destination);
      src.start();
      const resampled = await offlineCtx.startRendering();
      const pcm = resampled.getChannelData(0);
      const wav = encodeWAV(pcm, 16000);
      const bytes = new Uint8Array(wav);
      let binary = "";
      for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
      const b64 = btoa(binary);

      const newTakes = [...takes, b64];
      setTakes(newTakes);

      if (newTakes.length >= TAKES_REQUIRED) {
        onComplete(newTakes);
      }
    } catch (err) {
      onError(`Microphone error: ${getErrorMessage(err, "unknown")}`);
    } finally {
      clearInterval(timer);
      setRecording(false);
    }
  }

  function reset() {
    setTakes([]);
    setRecording(false);
    setCountdown(RECORD_SECONDS);
  }

  return {
    recordTake,
    reset,
    takes,
    recording,
    countdown,
    currentTake,
    takesRequired,
    done,
  };
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  }
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, (sampleRate * 16) / 8, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}
