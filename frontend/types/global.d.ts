// ── Shared types used across the app ──────────────────────────────

export type UserRole = "admin" | "officer" | "pensioner";

export type PensionerStatus = "ACTIVE" | "DECEASED" | "SUSPENDED" | "FLAGGED";

export type BiometricLevel = "L0" | "L1" | "L2" | "L3";

export type VerificationStatus =
  | "VERIFIED"
  | "FAILED"
  | "MANUAL_OVERRIDE"
  | "PENDING";

export type DocumentType =
  | "Retirement Notice"
  | "Authorization Letter"
  | "ID Card"
  | "Clearance Form"
  | "Verification Certificate"
  | "Death Certificate";

export type OnboardingStep =
  | "personal"
  | "face"
  | "voice"
  | "docs"
  | "complete";
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
      onboardingStep?: OnboardingStep;
    };
    unsafeMetadata?: {
      onboardingComplete?: boolean; // 👈 add this
    };
  }
}
