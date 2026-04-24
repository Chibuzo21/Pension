import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users (synced from Clerk via webhook) ──────────────────────
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("officer"),
      v.literal("pensioner"),
    ),
    pensionerId: v.optional(v.id("pensioners")),
    isActive: v.boolean(),
    lastLogin: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_pensionerId", ["pensionerId"]),

  // ── Pensioners ─────────────────────────────────────────────────
  pensioners: defineTable({
    pensionId: v.string(), // e.g. PEN-2024-00042
    fullName: v.string(),
    userId: v.optional(v.string()),
    faceEmbedding: v.optional(v.string()), //
    dob: v.string(), // ISO date string
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bvn: v.optional(v.string()), // 11 digits
    nin: v.optional(v.string()), // 11 digits
    dateOfEmployment: v.optional(v.string()),
    dateOfRetirement: v.optional(v.string()),
    lastMda: v.optional(v.string()), // last Ministry/Dept/Agency
    subTreasury: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    gratuityAmount: v.number(),
    gratuityPaid: v.number(),
    verificationCode: v.optional(v.string()),
    createdByUserId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("deceased"),
      v.literal("suspended"),
      v.literal("flagged"),
      v.literal("dormant"),
      v.literal("incapacitated"),
    ),
    // Biometric fields
    faceEncoding: v.optional(v.string()), // JSON-serialised 512-float array
    referencePhotoStorageId: v.optional(v.string()), // Convex storage ID
    fingerprintCredentialId: v.optional(v.string()),
    fingerprintPublicKey: v.optional(v.string()),
    fingerprintSignCount: v.optional(v.number()),
    fingerprintAaguid: v.optional(v.string()),
    voiceEncoding: v.optional(v.string()), // JSON-serialised 40-float MFCC
    biometricLevel: v.union(
      v.literal("L0"), // no biometrics
      v.literal("L1"), // face only

      v.literal("L2"), // face + voice (partial)
      v.literal("L3"), // full multi-modal
    ),
    // Death recording
    dateOfDeath: v.optional(v.string()),
    deathCertificateStorageId: v.optional(v.string()),
    deathConfirmedByUserId: v.optional(v.id("users")),
    deathConfirmedAt: v.optional(v.number()),

    // Missed verification tracking
    lastVerifiedAt: v.optional(v.number()),
    missedVerificationCount: v.optional(v.number()),

    // Incapacitation
    incapacitationReason: v.optional(v.string()),
    proxyVerifierId: v.optional(v.id("nextOfKin")),
  })
    .index("by_pensionId", ["pensionId"])
    .index("by_status", ["status"])
    .index("by_nin", ["nin"])
    .index("by_biometricLevel", ["biometricLevel"])
    .searchIndex("search_name", {
      searchField: "fullName",
      filterFields: ["status"],
    }),

  // ── Next of Kin ────────────────────────────────────────────────
  nextOfKin: defineTable({
    pensionerId: v.id("pensioners"),
    fullName: v.string(),
    relationship: v.string(),
    phone: v.string(), // required — primary contact channel
    address: v.optional(v.string()), // optional but useful for correspondence
    bvn: v.optional(v.string()),
    nin: v.optional(v.string()),

    addedByUserId: v.id("users"),
    addedAt: v.number(),
    isVerified: v.optional(v.boolean()), // defaults to falsy if absent
    verifiedByUserId: v.optional(v.id("users")), // who toggled verified
    verifiedAt: v.optional(v.number()), // when it was verified
  }).index("by_pensioner", ["pensionerId"]),
  // ── Death Claims ───────────────────────────────────────────────
  deathClaims: defineTable({
    pensionerId: v.id("pensioners"),
    claimedByNextOfKinId: v.id("nextOfKin"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    deathCertificateStorageId: v.string(),
    reviewedByUserId: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),

  // ── Documents ──────────────────────────────────────────────────
  documents: defineTable({
    pensionerId: v.id("pensioners"),
    documentType: v.union(
      v.literal("Retirement Notice"),
      v.literal("Authorization Letter"),
      v.literal("ID Card"),
      v.literal("Clearance Form"),
      v.literal("Verification Certificate"),
      v.literal("Death Certificate"),
    ),
    storageId: v.string(), // Convex file storage ID
    filename: v.string(),
    mimeType: v.string(),
    uploadedBy: v.id("users"),
  }).index("by_pensioner", ["pensionerId"]),

  // ── Verifications ──────────────────────────────────────────────
  verifications: defineTable({
    fullName: v.optional(v.string()),
    pensionerId: v.id("pensioners"),
    officerId: v.optional(v.id("users")),
    status: v.union(
      v.literal("VERIFIED"),
      v.literal("FAILED"),
      v.literal("MANUAL_OVERRIDE"),
      v.literal("PENDING"),
    ),
    // Per-modality scores (0.0 – 1.0)
    livenessScore: v.optional(v.number()),
    faceMatchScore: v.optional(v.number()),
    fingerprintScore: v.optional(v.number()),
    voiceScore: v.optional(v.number()),
    fusedScore: v.optional(v.number()),
    assuranceLevel: v.optional(
      v.union(
        v.literal("L1"),
        v.literal("L2"),
        v.literal("L3"),
        v.literal("L0"),
      ),
    ),
    captureStorageId: v.optional(v.string()),
    overrideReason: v.optional(v.string()),
    verificationDate: v.string(), // ISO datetime
    ipAddress: v.optional(v.string()),
  })
    .index("by_pensioner", ["pensionerId"])
    .index("by_date", ["verificationDate"])
    .index("by_pensioner_date", ["pensionerId", "verificationDate"]),

  // ── Audit Logs ─────────────────────────────────────────────────
  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    username: v.optional(v.string()),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    details: v.optional(v.string()),
  }),

  // ── Notifications ──────────────────────────────────────────────
  notifications: defineTable({
    pensionerId: v.id("pensioners"),
    type: v.union(
      v.literal("VERIFICATION_FAILED"),
      v.literal("VERIFICATION_SUCCESS"),
      v.literal("OVERDUE_REMINDER"),
      v.literal("STATUS_CHANGE"),
      v.literal("BULK"),
    ),
    sentAt: v.string(),
    status: v.union(
      v.literal("SENT"),
      v.literal("FAILED"),
      v.literal("PENDING"),
    ),
    recipientEmail: v.optional(v.string()),
    message: v.optional(v.string()),
  }).index("by_pensioner", ["pensionerId"]),

  // ── Login Rate Limiting ────────────────────────────────────────
  loginAttempts: defineTable({
    ipAddress: v.string(),
    clerkId: v.optional(v.string()),
    success: v.boolean(),
    attemptedAt: v.string(),
  }).index("by_ip", ["ipAddress"]),
});
