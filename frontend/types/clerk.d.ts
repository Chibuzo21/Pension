// types/clerk.d.ts  (or globals.d.ts — just needs to be included by tsconfig)
import { UserRole } from "./global";

export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
    unsafeMetadata?: {
      onboardingComplete?: boolean;
    };
  }
}
