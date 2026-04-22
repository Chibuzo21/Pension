import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ── Queries ────────────────────────────────────────────────────────

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const verifications = await ctx.db
      .query("verifications")
      .order("desc")
      .take(limit);

    return Promise.all(
      verifications.map(async (v) => {
        const pensioner = await ctx.db.get(v.pensionerId);
        return { ...v, pensioner };
      }),
    );
  },
});

export const getForPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return ctx.db
      .query("verifications")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .order("desc")
      .take(50);
  },
});

export const getOverdue = query({
  args: { daysThreshold: v.optional(v.number()) },
  handler: async (ctx, { daysThreshold = 37 }) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);
    const cutoffStr = cutoff.toISOString();

    const activePensioners = await ctx.db
      .query("pensioners")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const overdue = await Promise.all(
      activePensioners.map(async (p) => {
        const latest = await ctx.db
          .query("verifications")
          .withIndex("by_pensioner", (q) => q.eq("pensionerId", p._id))
          .order("desc")
          .first();

        const isOverdue = !latest || latest.verificationDate < cutoffStr;
        return isOverdue ? { ...p, lastVerification: latest } : null;
      }),
    );

    return overdue.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

export const getMonthlyCompliance = query({
  args: {},
  handler: async (ctx) => {
    const months: {
      month: string;
      failed: number;
      year: number;
      verified: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

      const verified = await ctx.db
        .query("verifications")
        .withIndex("by_date", (q) =>
          q.gte("verificationDate", start).lte("verificationDate", end),
        )
        .filter((q) => q.eq(q.field("status"), "VERIFIED"))
        .collect();

      const failed = await ctx.db
        .query("verifications")
        .withIndex("by_date", (q) =>
          q.gte("verificationDate", start).lte("verificationDate", end),
        )
        .filter((q) => q.eq(q.field("status"), "FAILED"))
        .collect();

      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        verified: verified.length,
        failed: failed.length,
      });
    }
    return months;
  },
});

// ── Mutations ──────────────────────────────────────────────────────

export const recordVerification = mutation({
  args: {
    fullName: v.string(),
    pensionerId: v.id("pensioners"),
    officerId: v.optional(v.id("users")),
    status: v.union(
      v.literal("VERIFIED"),
      v.literal("FAILED"),
      v.literal("PENDING"),
    ),
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
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("verifications", {
      fullName: args.fullName,
      pensionerId: args.pensionerId,
      officerId: args.officerId,
      status: args.status,
      livenessScore: args.livenessScore,
      faceMatchScore: args.faceMatchScore,
      fingerprintScore: args.fingerprintScore,
      voiceScore: args.voiceScore,
      fusedScore: args.fusedScore,
      assuranceLevel: args.assuranceLevel,
      captureStorageId: args.captureStorageId,
      ipAddress: args.ipAddress,
      verificationDate: new Date().toISOString(),
    });

    await ctx.db.patch(args.pensionerId, {
      lastVerifiedAt: Date.now(),
      missedVerificationCount: 0, // reset the counter on successful verification
    });
    await ctx.db.insert("auditLogs", {
      userId: args.officerId,
      action: `VERIFICATION_${args.status}`,
      entityType: "pensioner",
      entityId: args.pensionerId,
      details: `Fused score: ${args.fusedScore?.toFixed(3) ?? "N/A"} | Level: ${args.assuranceLevel ?? "N/A"}`,
      ipAddress: args.ipAddress,
    });

    return id;
  },
});

export const overrideVerification = mutation({
  args: {
    verificationId: v.id("verifications"),
    newStatus: v.union(
      v.literal("VERIFIED"),
      v.literal("FAILED"),
      v.literal("MANUAL_OVERRIDE"),
    ),
    reason: v.string(),
    overriddenByUserId: v.id("users"),
  },
  handler: async (
    ctx,
    { verificationId, newStatus, reason, overriddenByUserId },
  ) => {
    const verification = await ctx.db.get(verificationId);
    if (!verification) throw new Error("Verification not found");

    await ctx.db.patch(verificationId, {
      status: newStatus,
      overrideReason: reason,
    });

    await ctx.db.insert("auditLogs", {
      userId: overriddenByUserId,
      action: "VERIFICATION_OVERRIDDEN",
      entityType: "verification",
      entityId: verificationId,
      details: `Override to ${newStatus}: ${reason}`,
    });
  },
});
// Add to convex/verification.ts

/** Returns the most recent verification for a pensioner this calendar month */
export const getThisMonthVerification = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    const now = new Date();
    // Start of current month in UTC
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    ).getTime();

    const verifications = await ctx.db
      .query("verifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("pensionerId"), pensionerId),
          q.gte(q.field("_creationTime"), monthStart),
        ),
      )
      .order("desc")
      .first();

    return verifications ?? null;
  },
});
