import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  encodeWAV,
  VOICE_SECONDS,
  type StepStatus,
  type ModalityResult,
  type Phrase,
} from "@/lib/biometric-utils";
import { getErrorMessage } from "@/lib/errors";

type UseVoiceVerifyOptions = {
  active: boolean; // true when the voice step is shown
  pensionerVoiceEncoding: string | undefined;
  onResult: (result: ModalityResult) => void;
};

export function useVoiceVerify({
  active,
  pensionerVoiceEncoding,
  onResult,
}: UseVoiceVerifyOptions) {
  const [voiceStatus, setVoiceStatus] = useState<StepStatus>("idle");
  const [voiceCountdown, setVoiceCountdown] = useState(VOICE_SECONDS);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [activePhrase, setActivePhrase] = useState<Phrase | null>(null);

  // Load phrases when voice step becomes active
  useEffect(() => {
    if (!active) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SPEAKER_SERVICE_URL ?? "http://localhost:8000"}/phrases`,
    )
      .then((r) => r.json())
      .then((data: { phrases: Phrase[] }) => {
        setPhrases(data.phrases);
        setActivePhrase(
          data.phrases[Math.floor(Math.random() * data.phrases.length)],
        );
      })
      .catch(() =>
        toast.error("Could not load verification phrase — please retry"),
      );
  }, [active]);

  async function handleStartVoice() {
    if (!activePhrase) {
      toast.error("Phrase not loaded yet — please wait");
      return;
    }

    setVoiceStatus("capturing");
    setVoiceCountdown(VOICE_SECONDS);

    let secs = VOICE_SECONDS;
    const timer = setInterval(() => {
      secs--;
      setVoiceCountdown(secs);
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
      await new Promise<void>((r) => setTimeout(r, VOICE_SECONDS * 1000));
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
      stream.getTracks().forEach((t) => t.stop());
      clearInterval(timer);

      // Resample to 16kHz WAV
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const blob = new Blob(chunks, { type: "audio/webm" });
      const audioBuffer = await audioCtx.decodeAudioData(
        await blob.arrayBuffer(),
      );
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

      // Convert to base64
      const bytes = new Uint8Array(wav);
      let binary = "";
      for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
      const audioBase64 = btoa(binary);

      setVoiceStatus("processing");
      await runVoiceVerify(audioBase64);
    } catch (err) {
      clearInterval(timer);
      toast.error(`Microphone error:${getErrorMessage(err, "unknown")}`);
      setVoiceStatus("failed");
    }
  }

  async function runVoiceVerify(audioBase64: string) {
    if (!activePhrase) return;

    try {
      const referenceEmbedding = pensionerVoiceEncoding
        ? JSON.parse(pensionerVoiceEncoding)
        : null;

      if (!referenceEmbedding) {
        toast.error("No voice reference — please re-enrol");
        setVoiceStatus("failed");
        return;
      }

      const res = await fetch("/api/verify/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          referenceEmbedding,
          phraseIndex: activePhrase.index,
          mode: "verify",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Voice check failed");

      if (data.reason === "speech_mismatch") {
        onResult({
          score: data.score,
          passed: false,
          label: "Phrase not detected in speech",
        });
        setVoiceStatus("failed");
        toast.error(
          `Expected: "${data.expected_phrase}" — heard: "${data.transcript}" (${Math.round((data.overlap ?? 0) * 100)}% match)`,
        );
        return;
      }

      const result: ModalityResult = {
        score: data.score,
        passed: data.passed,
        label: data.passed
          ? `Voice match: ${(data.score * 100).toFixed(0)}%`
          : `Voice failed (${(data.score * 100).toFixed(0)}%)`,
      };
      setVoiceStatus(data.passed ? "done" : "failed");
      onResult(result);
    } catch (err) {
      toast.error(getErrorMessage("Voice analysis failed"));
      setVoiceStatus("failed");
    }
  }

  function handleRetryVoice() {
    setVoiceStatus("idle");
    if (phrases.length) {
      setActivePhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }
  }

  return {
    voiceStatus,
    voiceCountdown,
    activePhrase,
    handleStartVoice,
    handleRetryVoice,
  };
}
