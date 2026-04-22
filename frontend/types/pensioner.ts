import { Doc } from "@/convex/_generated/dataModel";

export type PensionerStatus =
  | "active"
  | "dormant"
  | "suspended"
  | "incapacitated"
  | "deceased"
  | "flagged";

export type StatusAction = "deceased" | "incapacitated" | "reinstate";

export const STATUS_STYLE: Record<PensionerStatus, string> = {
  active: "text-emerald-700 bg-emerald-50 border-emerald-200",
  dormant: "text-amber-700 bg-amber-50 border-amber-200",
  suspended: "text-orange-700 bg-orange-50 border-orange-200",
  incapacitated: "text-blue-700 bg-blue-50 border-blue-200",
  deceased: "text-red-700 bg-red-50 border-red-200",
  flagged: "text-green-700 bg-green-50 border-green-200",
};

export const LEVEL_STYLE: Record<string, string> = {
  L0: "text-slate-500 bg-slate-100",
  L1: "text-blue-600 bg-blue-50",
  L3: "text-emerald-600 bg-emerald-50",
};

export const RELATIONSHIPS = [
  "Son",
  "Daughter",
  "Spouse",
  "Sibling",
  "Nephew",
  "Niece",
  "Grandchild",
  "Other",
];

// export interface NextOfKin {
//   _id: Id<"nextOfKin">;
//   fullName: string;
//   relationship: string;
//   phone: string;
//   nationalId?: string;
//   isVerified?: boolean;
//   addedAt: number;
// }

// export interface Verification {
//   _id: Id<"verifications">;
//   _creationTime?: number;
//   status: "VERIFIED" | "FAILED" | "PENDING" | "MANUAL_OVERRIDE";
//   fusedScore?: number;
//   faceMatchScore?: number;
//   voiceScore?: number;
//   assuranceLevel?: string;
// }

// export interface Pensioner {
//   _id: Id<"pensioners">;
//   fullName: string;
//   pensionId: string;
//   phone?: string;
//   nin?: string;
//   address?: string;
//   bankName?: string;
//   accountNumber?: string;
//   status?: PensionerStatus;
//   biometricLevel?: string;
//   faceEncoding?: string;
//   voiceEncoding?: string;
//   lastVerifiedAt?: number;
//   missedVerificationCount?: number;
//   deathConfirmedAt?: number;
//   dateOfDeath?: string;
//   incapacitationReason?: string;
// }
export type PensionerRow = Doc<"pensioners"> & {
  lastVerification?: { verificationDate: string } | null;
};
