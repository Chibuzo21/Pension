import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Get all next of kin for a pensioner */
export const getByPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return await ctx.db
      .query("nextOfKin")
      .filter((q) => q.eq(q.field("pensionerId"), pensionerId))
      .order("desc")
      .collect();
  },
});

/** Get a single NOK record */
export const getById = query({
  args: { id: v.id("nextOfKin") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Get all death claims — for the admin deaths dashboard */
export const getAllDeathClaims = query({
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
    let claimsQuery = ctx.db.query("deathClaims").order("desc");
    const claims = await claimsQuery.collect();

    const filtered = status
      ? claims.filter((c) => c.status === status)
      : claims;

    // Join pensioner and NOK names for display
    return await Promise.all(
      filtered.map(async (claim) => {
        const pensioner = await ctx.db.get(claim.pensionerId);
        const nok = await ctx.db.get(claim.claimedByNextOfKinId);
        return {
          ...claim,
          pensionerName: pensioner?.fullName,
          nokName: nok?.fullName,
        };
      }),
    );
  },
});

/** Get all dormant pensioners — for officer follow-up */
export const getDormantPensioners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pensioners")
      .filter((q) => q.eq(q.field("status"), "dormant"))
      .order("desc")
      .collect();
  },
});

/** Get all deceased pensioners */
export const getDeceasedPensioners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pensioners")
      .filter((q) => q.eq(q.field("status"), "deceased"))
      .order("desc")
      .collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Add a next of kin record to a pensioner */
export const addNextOfKin = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    fullName: v.string(),
    relationship: v.string(),
    phone: v.string(),
    nin: v.optional(v.string()),
    addedByUserId: v.id("users"),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pensioner = await ctx.db.get(args.pensionerId);
    if (!pensioner) throw new Error("Pensioner not found");

    return await ctx.db.insert("nextOfKin", {
      pensionerId: args.pensionerId,
      fullName: args.fullName,
      relationship: args.relationship,
      phone: args.phone,
      address: args.address,
      nin: args.nin,
      isVerified: false,
      addedByUserId: args.addedByUserId,
      addedAt: Date.now(),
    });
  },
});

/** Update a NOK record */
export const updateNextOfKin = mutation({
  args: {
    id: v.id("nextOfKin"),
    fullName: v.optional(v.string()),
    relationship: v.optional(v.string()),
    phone: v.optional(v.string()),
    nin: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("NOK record not found");
    await ctx.db.patch(id, fields);
  },
});

/** Remove a NOK record */
export const removeNextOfKin = mutation({
  args: { id: v.id("nextOfKin") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Submit a death claim — called by an officer on behalf of NOK */
export const submitDeathClaim = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    claimedByNextOfKinId: v.id("nextOfKin"),
    deathCertificateStorageId: v.string(),
    submittedByUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pensioner = await ctx.db.get(args.pensionerId);
    if (!pensioner) throw new Error("Pensioner not found");
    if (pensioner.status === "deceased")
      throw new Error("Already marked deceased");

    // Suspend immediately pending review
    await ctx.db.patch(args.pensionerId, { status: "suspended" });

    await ctx.db.insert("auditLogs", {
      action: "DEATH_CLAIM_SUBMITTED",
      entityType: "pensioner",
      entityId: args.pensionerId,
      userId: args.submittedByUserId,
      details: `Death claim submitted by NOK ${args.claimedByNextOfKinId}`,
    });

    // submitDeathClaim — fix deathClaims insert (remove submittedAt)
    return await ctx.db.insert("deathClaims", {
      pensionerId: args.pensionerId,
      claimedByNextOfKinId: args.claimedByNextOfKinId,
      deathCertificateStorageId: args.deathCertificateStorageId,
      status: "pending",
      // remove submittedAt — not in schema
    });
  },
});

/** Approve or reject a death claim */
export const reviewDeathClaim = mutation({
  args: {
    claimId: v.id("deathClaims"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    reviewedByUserId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { claimId, decision, reviewedByUserId, notes }) => {
    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");
    if (claim.status !== "pending") throw new Error("Claim already reviewed");

    await ctx.db.patch(claimId, {
      status: decision,
      reviewedByUserId,
      reviewedAt: Date.now(),
      notes,
    });

    if (decision === "approved") {
      const pensioner = await ctx.db.get(claim.pensionerId);
      await ctx.db.patch(claim.pensionerId, {
        status: "deceased",
        deathConfirmedByUserId: reviewedByUserId,
        deathConfirmedAt: Date.now(),
      });
      await ctx.db.insert("auditLogs", {
        action: "MARKED_DECEASED",
        entityType: "pensioner",
        entityId: claim.pensionerId,
        userId: reviewedByUserId,
        details: `Death confirmed. Pension payments should be stopped.`,
      });
    } else {
      // Rejected — reinstate to active
      await ctx.db.patch(claim.pensionerId, { status: "active" });
    }
  },
});

/** Mark a dormant pensioner as deceased directly (field investigation outcome) */
export const markDeceased = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    dateOfDeath: v.optional(v.string()),
    deathCertificateStorageId: v.optional(v.string()),
    confirmedByUserId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pensioner = await ctx.db.get(args.pensionerId);
    if (!pensioner) throw new Error("Pensioner not found");

    await ctx.db.patch(args.pensionerId, {
      status: "deceased",
      dateOfDeath: args.dateOfDeath,
      deathCertificateStorageId: args.deathCertificateStorageId,
      deathConfirmedByUserId: args.confirmedByUserId,
      deathConfirmedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      action: "MARKED_DECEASED",
      entityType: "pensioner",
      entityId: args.pensionerId,
      userId: args.confirmedByUserId,
      details: args.notes ?? "Marked deceased by officer",
    });
  },
});

/** Mark a dormant pensioner as incapacitated */
export const markIncapacitated = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    reason: v.string(),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { pensionerId, reason, updatedByUserId }) => {
    await ctx.db.patch(pensionerId, {
      status: "incapacitated",
      incapacitationReason: reason,
    });
    await ctx.db.insert("auditLogs", {
      action: "MARKED_INCAPACITATED",
      entityType: "pensioner",
      entityId: pensionerId,
      userId: updatedByUserId,
      details: reason,
    });
  },
});

/** Reinstate a suspended or dormant pensioner back to active */
export const reinstateToActive = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    reinstatedByUserId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { pensionerId, reinstatedByUserId, notes }) => {
    await ctx.db.patch(pensionerId, {
      status: "active",
      missedVerificationCount: 0,
    });
    await ctx.db.insert("auditLogs", {
      action: "REINSTATED",
      entityType: "pensioner",
      entityId: pensionerId,
      userId: reinstatedByUserId,
      details: notes ?? "Reinstated to active",
    });
  },
});
