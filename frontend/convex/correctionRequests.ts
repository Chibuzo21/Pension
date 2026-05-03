// convex/correctionRequests.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  nin: "NIN",
  bvn: "BVN",
};

// ── Queries ────────────────────────────────────────────────────────────────

/** All requests — for admin list page, newest first */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
    ),
  },
  handler: async (ctx, { status }) => {
    const base = status
      ? ctx.db
          .query("correctionRequests")
          .withIndex("by_status", (q) => q.eq("status", status))
      : ctx.db.query("correctionRequests");

    const rows = await base.order("desc").take(100);

    return Promise.all(
      rows.map(async (r) => {
        const pensioner = await ctx.db.get(r.pensionerId);
        const reviewer = r.reviewedByUserId
          ? await ctx.db.get(r.reviewedByUserId)
          : null;
        return { ...r, pensioner, reviewer };
      }),
    );
  },
});

/** Requests for a single pensioner — for admin profile tab */
export const getForPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    const rows = await ctx.db
      .query("correctionRequests")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .order("desc")
      .take(20);

    return Promise.all(
      rows.map(async (r) => {
        const reviewer = r.reviewedByUserId
          ? await ctx.db.get(r.reviewedByUserId)
          : null;
        return { ...r, reviewer };
      }),
    );
  },
});

/** Pending count — for admin dashboard badge */
export const pendingCount = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("correctionRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return rows.length;
  },
});

/** Pensioner's own requests */
export const getMyRequests = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return ctx.db
      .query("correctionRequests")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .order("desc")
      .take(10);
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/** Pensioner submits a correction request */
export const submit = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    submittedByUserId: v.optional(v.id("users")),
    field: v.union(v.literal("fullName"), v.literal("nin"), v.literal("bvn")),
    requestedValue: v.string(),
    supportingNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pensioner = await ctx.db.get(args.pensionerId);
    if (!pensioner) throw new Error("Pensioner not found");

    // Snapshot current value
    const currentValue =
      args.field === "fullName"
        ? pensioner.fullName
        : args.field === "nin"
          ? (pensioner.nin ?? "")
          : (pensioner.bvn ?? "");

    // Prevent duplicate pending requests for the same field
    const existing = await ctx.db
      .query("correctionRequests")
      .withIndex("by_pensioner_status", (q) =>
        q.eq("pensionerId", args.pensionerId).eq("status", "pending"),
      )
      .filter((q) => q.eq(q.field("field"), args.field))
      .first();

    if (existing) {
      throw new Error(
        `A pending correction for ${FIELD_LABELS[args.field]} already exists`,
      );
    }

    const id = await ctx.db.insert("correctionRequests", {
      pensionerId: args.pensionerId,
      submittedByUserId: args.submittedByUserId,
      field: args.field,
      currentValue,
      requestedValue: args.requestedValue.trim(),
      supportingNote: args.supportingNote?.trim() || undefined,
      status: "pending",
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: args.submittedByUserId,
      action: "CORRECTION_REQUESTED",
      entityType: "pensioner",
      entityId: args.pensionerId,
      details: `Field: ${FIELD_LABELS[args.field]} → "${args.requestedValue.trim()}"`,
    });

    return id;
  },
});

/** Admin approves — writes the new value directly to the pensioner record */
export const approve = mutation({
  args: {
    requestId: v.id("correctionRequests"),
    reviewedByUserId: v.id("users"),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, reviewedByUserId, reviewNote }) => {
    const req = await ctx.db.get(requestId);
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Request already reviewed");

    // Patch the pensioner record
    const patch: Record<string, string> = {
      [req.field]: req.requestedValue,
    };
    await ctx.db.patch(req.pensionerId, patch);

    // Mark request resolved
    await ctx.db.patch(requestId, {
      status: "approved",
      reviewedByUserId,
      reviewedAt: Date.now(),
      reviewNote: reviewNote?.trim() || undefined,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: reviewedByUserId,
      action: "CORRECTION_APPROVED",
      entityType: "pensioner",
      entityId: req.pensionerId,
      details: `${FIELD_LABELS[req.field]} changed to "${req.requestedValue}"`,
    });
  },
});

/** Admin rejects — request closed, record untouched */
export const reject = mutation({
  args: {
    requestId: v.id("correctionRequests"),
    reviewedByUserId: v.id("users"),
    reviewNote: v.string(), // required for rejection
  },
  handler: async (ctx, { requestId, reviewedByUserId, reviewNote }) => {
    const req = await ctx.db.get(requestId);
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Request already reviewed");

    await ctx.db.patch(requestId, {
      status: "rejected",
      reviewedByUserId,
      reviewedAt: Date.now(),
      reviewNote: reviewNote.trim(),
    });

    await ctx.db.insert("auditLogs", {
      userId: reviewedByUserId,
      action: "CORRECTION_REJECTED",
      entityType: "pensioner",
      entityId: req.pensionerId,
      details: `${FIELD_LABELS[req.field]} — rejected: ${reviewNote.trim()}`,
    });
  },
});
