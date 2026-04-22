export type Step = "face" | "voice" | "result";

export type StepStatus =
  | "idle"
  | "capturing"
  | "processing"
  | "done"
  | "failed";

export interface ModalityResult {
  score: number;
  passed: boolean;
  label: string;
}

export interface VerifyResults {
  face?: ModalityResult;
  voice?: ModalityResult;
  fused?: number;
  level?: string;
  overall?: "VERIFIED" | "FAILED";
}
