// ─── Constants ────────────────────────────────────────────────────────────────
export const SESSION_MS = 15 * 60 * 1000;
export const FUSED_THRESHOLD = 0.72;
export const VOICE_SECONDS = 7;
export const LIVENESS_FRAME_COUNT = 10;
export const LIVENESS_FRAME_MS = 300;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ModalityResult {
  score: number;
  passed: boolean;
  label: string;
}

export interface VerificationResults {
  face?: ModalityResult;
  voice?: ModalityResult;
  fused?: number;
  level?: string;
  overall?: "VERIFIED" | "FAILED";
}

export interface Phrase {
  index: number;
  text: string;
}

export type StepStatus =
  | "idle"
  | "capturing"
  | "processing"
  | "done"
  | "failed";
export type Step = "face" | "voice" | "result";

// ─── WAV encoder ──────────────────────────────────────────────────────────────
export function encodeWAV(
  samples: Float32Array,
  sampleRate: number,
): ArrayBuffer {
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

// Mirror of what Python's inflect does — good enough for 10–99
export function numberToWords(n: number): string {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  if (n < 20) return ones[n];
  const t = tens[Math.floor(n / 10)];
  const o = ones[n % 10];
  return o ? `${t} ${o}` : t;
}

// ─── Fusion ───────────────────────────────────────────────────────────────────
export function computeFusion(
  face?: ModalityResult,
  voice?: ModalityResult,
): {
  fused: number;
  level: "L0" | "L1" | "L3" | "L2";
  overall: "VERIFIED" | "FAILED";
} {
  const wF = face ? 0.6 : 0;
  const wV = voice ? 0.4 : 0;
  const wTotal = wF + wV || 1;
  const fused = ((face?.score ?? 0) * wF + (voice?.score ?? 0) * wV) / wTotal;
  const count = [face, voice].filter(Boolean).length;
  const level = count === 2 ? "L3" : count === 1 ? "L1" : "L0";
  const bothPassed = (!face || face.passed) && (!voice || voice.passed);
  const overall: "VERIFIED" | "FAILED" =
    bothPassed && fused >= FUSED_THRESHOLD ? "VERIFIED" : "FAILED";
  return { fused, level, overall };
}
