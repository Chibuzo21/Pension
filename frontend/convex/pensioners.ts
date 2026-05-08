import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

// ── Queries ────────────────────────────────────────────────────────

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
    biometricLevel: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, status, biometricLevel }) => {
    let q = ctx.db.query("pensioners").order("desc");

    if (status) {
      q = ctx.db
        .query("pensioners")
        .withIndex("by_status", (q) =>
          q.eq(
            "status",
            status as "active" | "deceased" | "suspended" | "flagged",
          ),
        )
        .order("desc");
    }

    const page = await q.paginate(paginationOpts);

    const enriched = await Promise.all(
      page.page.map(async (p) => {
        const latestVerification = await ctx.db
          .query("verifications")
          .withIndex("by_pensioner", (q) => q.eq("pensionerId", p._id))
          .order("desc")
          .first();
        return { ...p, latestVerification };
      }),
    );

    return { ...page, page: enriched };
  },
});

// convex/pensioners.ts

export const getMdaCompliance = query({
  args: { daysThreshold: v.optional(v.number()) },
  handler: async (ctx, { daysThreshold = 37 }) => {
    const pensioners = await ctx.db.query("pensioners").collect();
    const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;

    // Group by lastMda
    const mdaMap: Record<string, { total: number; compliant: number }> = {};

    for (const p of pensioners) {
      const mda = p.lastMda ?? "Unassigned";
      if (!mdaMap[mda]) mdaMap[mda] = { total: 0, compliant: 0 };
      mdaMap[mda].total++;

      // Check latest verification
      const verifications = await ctx.db
        .query("verifications")
        .withIndex("by_pensioner", (q) => q.eq("pensionerId", p._id))
        .order("desc")
        .first();

      if (
        verifications &&
        new Date(verifications.verificationDate).getTime() >= cutoff
      ) {
        mdaMap[mda].compliant++;
      }
    }

    return Object.entries(mdaMap)
      .map(([mda, { total, compliant }]) => ({
        mda,
        total,
        compliant,
        rate: Math.round((compliant / total) * 100),
      }))
      .sort((a, b) => b.rate - a.rate); // highest compliance first
  },
});
export const search = query({
  args: {
    query: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { query: searchQuery, status }) => {
    if (!searchQuery.trim()) {
      return ctx.db.query("pensioners").order("desc").take(50);
    }

    const results = await ctx.db
      .query("pensioners")
      .withSearchIndex("search_all", (q) => {
        let sq = q.search("searchText", searchQuery);
        if (status) {
          sq = sq.eq(
            "status",
            status as "active" | "deceased" | "suspended" | "flagged",
          );
        }
        return sq;
      })
      .take(50);

    return results;
  },
});

export const getById = query({
  args: { id: v.id("pensioners") },
  handler: async (ctx, { id }) => {
    const pensioner = await ctx.db.get(id);
    if (!pensioner) return null;

    const nextOfKin = await ctx.db
      .query("nextOfKin")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", id))
      .collect();

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", id))
      .collect();

    const verifications = await ctx.db
      .query("verifications")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", id))
      .order("desc")
      .take(20);

    return { ...pensioner, nextOfKin, documents, verifications };
  },
});

export const getByPensionId = query({
  args: { pensionId: v.string() },
  handler: async (ctx, { pensionId }) => {
    const pensioner = await ctx.db
      .query("pensioners")
      .withIndex("by_pensionId", (q) => q.eq("pensionId", pensionId))
      .unique();

    if (!pensioner) return null;

    // Only return what the public form needs — don't expose sensitive fields
    return {
      _id: pensioner._id,
      fullName: pensioner.fullName,
      pensionId: pensioner.pensionId,
      status: pensioner.status,
    };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("pensioners").collect();
    const total = all.length;
    const active = all.filter((p) => p.status === "active").length;
    const deceased = all.filter((p) => p.status === "deceased").length;
    const suspended = all.filter((p) => p.status === "suspended").length;
    const flagged = all.filter((p) => p.status === "flagged").length;
    const l3 = all.filter((p) => p.biometricLevel === "L3").length;
    const l1l2 = all.filter(
      (p) => p.biometricLevel === "L1" || p.biometricLevel === "L2",
    ).length;
    const l0 = all.filter((p) => p.biometricLevel === "L0").length;

    const now = new Date();
    const firstOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const recentVerifications = await ctx.db
      .query("verifications")
      .withIndex("by_date", (q) => q.gte("verificationDate", firstOfMonth))
      .collect();
    const verifiedThisMonth = recentVerifications.filter(
      (v) => v.status === "VERIFIED",
    ).length;
    const failedThisMonth = recentVerifications.filter(
      (v) => v.status === "FAILED",
    ).length;

    return {
      total,
      active,
      deceased,
      suspended,
      flagged,
      biometric: { l3, l1l2, l0 },
      verifiedThisMonth,
      failedThisMonth,
      complianceRate:
        active > 0 ? Math.round((verifiedThisMonth / active) * 100) : 0,
    };
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("pensioners")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
  },
});

export const linkUser = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    userId: v.id("users"),
  },
  handler: async (ctx, { pensionerId, userId }) => {
    const pensioner = await ctx.db.get(pensionerId);
    await ctx.db.patch(pensionerId, { userId });

    await ctx.db.insert("auditLogs", {
      userId,
      action: "PENSIONER_LINKED",
      entityType: "pensioner",
      entityId: pensionerId,
      details: `Pensioner ${pensioner?.fullName} linked to user account`,
    });
  },
});

// ── Helpers ────────────────────────────────────────────────────────

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}

function generatePensionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PEN-${year}-${rand}`;
}

// ── Mutations ──────────────────────────────────────────────────────

/**
 * Admin/officer creates a pensioner record on behalf of a pensioner.
 * createdByUserId is required here.
 */
export const create = mutation({
  args: {
    pensionId: v.string(),
    fullName: v.string(),
    dob: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bvn: v.optional(v.string()),
    nin: v.optional(v.string()),
    dateOfEmployment: v.optional(v.string()),
    dateOfRetirement: v.optional(v.string()),
    lastMda: v.optional(v.string()),
    subTreasury: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    gratuityAmount: v.number(),
    gratuityPaid: v.number(),
    createdByUserId: v.id("users"),
    searchText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pensioners")
      .withIndex("by_pensionId", (q) => q.eq("pensionId", args.pensionId))
      .first();
    if (existing)
      throw new Error(`Pension ID ${args.pensionId} already exists`);

    const id = await ctx.db.insert("pensioners", {
      ...args,
      selfRegistered: false,
      status: "active",
      biometricLevel: "L0",
      verificationCode: generateCode(),
      searchText:
        args.searchText ??
        `${args.fullName.toLowerCase()} ${args.pensionId.toLowerCase()} ${args.lastMda?.toLowerCase() ?? ""}`,
    });

    await ctx.db.insert("auditLogs", {
      userId: args.createdByUserId,
      action: "PENSIONER_CREATED",
      entityType: "pensioner",
      entityId: id,
      details: `Created pensioner ${args.fullName} (${args.pensionId})`,
    });

    return id;
  },
});

export const selfRegister = mutation({
  args: {
    fullName: v.string(),
    dob: v.string(),
    nin: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bvn: v.optional(v.string()),
    dateOfEmployment: v.optional(v.string()),
    dateOfRetirement: v.optional(v.string()),
    lastMda: v.optional(v.string()),
    lastRank: v.optional(v.string()),
    subTreasury: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    gratuityAmount: v.optional(v.number()),
    userId: v.id("users"),
    gratuityPaid: v.optional(v.number()),
    isDeceased: v.optional(v.boolean()),
    dateOfDeath: v.optional(v.string()),
    registrantName: v.optional(v.string()),
    registrantRelationship: v.optional(v.string()),
    registrantPhone: v.optional(v.string()),
    searchText: v.optional(v.string()),
    nok: v.optional(
      v.array(
        v.object({
          fullName: v.string(),
          relationship: v.string(),
          phone: v.string(),
          nin: v.optional(v.string()),
          address: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const {
      userId,
      isDeceased,
      dateOfDeath,
      registrantName,
      registrantRelationship,
      registrantPhone,
      ...data
    } = args;

    // Prevent duplicate NIN registrations
    const existingNin = await ctx.db
      .query("pensioners")
      .withIndex("by_nin", (q) => q.eq("nin", data.nin))
      .first();
    if (existingNin)
      throw new Error(
        "A pensioner record with this NIN already exists. Please contact support.",
      );

    // Auto-generate a unique pension ID
    let pensionId = generatePensionId();
    let collision = await ctx.db
      .query("pensioners")
      .withIndex("by_pensionId", (q) => q.eq("pensionId", pensionId))
      .first();
    while (collision) {
      pensionId = generatePensionId();
      collision = await ctx.db
        .query("pensioners")
        .withIndex("by_pensionId", (q) => q.eq("pensionId", pensionId))
        .first();
    }

    // Insert first — deceased flag affects initial status
    const id = await ctx.db.insert("pensioners", {
      ...data,
      pensionId,
      searchText:
        data.searchText ??
        `${data.fullName.toLowerCase()} ${pensionId.toLowerCase()} ${data.lastMda?.toLowerCase() ?? ""}`,
      nok: undefined,

      gratuityAmount: data.gratuityAmount ?? 0,
      gratuityPaid: data.gratuityPaid ?? 0,
      selfRegistered: true,
      // Suspend immediately if registering a deceased pensioner
      status: isDeceased ? "suspended" : "active",
      biometricLevel: "L0",
      verificationCode: generateCode(),
      userId,
      // Store death date on the record if provided
      dateOfDeath: isDeceased ? dateOfDeath : undefined,
    });

    // Link the user record back to this pensioner
    await ctx.db.patch(userId, { pensionerId: id, role: "pensioner" });
    const check = await ctx.db.get(userId);
    console.log("✅ After patch:", {
      userId,
      pensionerId: check?.pensionerId,
      role: check?.role,
    });

    // Audit log for normal registration
    await ctx.db.insert("auditLogs", {
      userId,
      action: "PENSIONER_SELF_REGISTERED",
      entityType: "pensioner",
      entityId: id,
      details: `Pensioner self-registered: ${data.fullName} (${pensionId})`,
    });

    // Additional audit log if deceased registration
    if (isDeceased) {
      await ctx.db.insert("auditLogs", {
        userId,
        action: "REGISTERED_AS_DECEASED",
        entityType: "pensioner",
        entityId: id,
        details: `Registered by ${registrantName ?? "unknown"} (${registrantRelationship ?? "unknown"}), phone: ${registrantPhone ?? "unknown"}`,
      });
    }
    if (data.nok && data.nok.length > 0) {
      await Promise.all(
        data.nok.map((nok) =>
          ctx.db.insert("nextOfKin", {
            pensionerId: id,
            fullName: nok.fullName,
            relationship: nok.relationship,
            phone: nok.phone,
            nin: nok.nin,
            address: nok.address,
            addedByUserId: userId,
            addedAt: Date.now(),
          }),
        ),
      );
    }

    return id;
  },
});
export const update = mutation({
  args: {
    id: v.id("pensioners"),
    fullName: v.optional(v.string()),
    dob: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bvn: v.optional(v.string()),
    nin: v.optional(v.string()),
    dateOfEmployment: v.optional(v.string()),
    dateOfRetirement: v.optional(v.string()),
    lastMda: v.optional(v.string()),
    lastRank: v.optional(v.string()),
    subTreasury: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    gratuityAmount: v.optional(v.number()),
    gratuityPaid: v.optional(v.number()),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { id, updatedByUserId, ...fields }) => {
    await ctx.db.patch(id, fields);
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "PENSIONER_UPDATED",
      entityType: "pensioner",
      entityId: id,
      details: `Updated pensioner record`,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("pensioners"),
    status: v.union(
      v.literal("active"),
      v.literal("deceased"),
      v.literal("suspended"),
      v.literal("flagged"),
    ),
    updatedByUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, updatedByUserId, reason }) => {
    const pensioner = await ctx.db.get(id);
    if (!pensioner) throw new Error("Pensioner not found");

    await ctx.db.patch(id, { status });
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "STATUS_CHANGED",
      entityType: "pensioner",
      entityId: id,
      details: `Status changed from ${pensioner.status} to ${status}${reason ? `: ${reason}` : ""}`,
    });
  },
});

export const updateBiometric = mutation({
  args: {
    id: v.id("pensioners"),
    faceEncoding: v.optional(v.string()),
    referencePhotoStorageId: v.optional(v.string()),
    fingerprintCredentialId: v.optional(v.string()),
    fingerprintPublicKey: v.optional(v.string()),
    fingerprintSignCount: v.optional(v.number()),
    voiceEncoding: v.optional(v.string()),
    biometricLevel: v.union(
      v.literal("L0"),
      v.literal("L1"),
      v.literal("L2"),
      v.literal("L3"),
    ),
    updatedByUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, updatedByUserId, ...biometricFields }) => {
    await ctx.db.patch(id, biometricFields);
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "BIOMETRIC_UPDATED",
      entityType: "pensioner",
      entityId: id,
      details: `Biometric level set to ${biometricFields.biometricLevel}`,
    });
  },
});

// ── Next of Kin ────────────────────────────────────────────────────

export const upsertNextOfKin = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    fullName: v.string(),
    relationship: v.string(),
    phone: v.string(),
    bvn: v.optional(v.string()),
    nin: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    address: v.optional(v.string()),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { updatedByUserId, ...args }) => {
    const existing = await ctx.db
      .query("nextOfKin")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", args.pensionerId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("nextOfKin", {
        ...args,
        isVerified: false,
        addedByUserId: updatedByUserId,
        addedAt: Date.now(),
      });
    }

    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "NOK_UPDATED",
      entityType: "pensioner",
      entityId: args.pensionerId,
      details: `Next of kin updated: ${args.fullName}`,
    });
  },
});

export const updateProfile = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    lastMda: v.optional(v.string()),
    subTreasury: v.optional(v.string()),
    dateOfEmployment: v.optional(v.string()),
    dateOfRetirement: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { pensionerId, ...fields } = args;

    // Strip undefined values so we don't overwrite existing data with nulls
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );

    await ctx.db.patch(pensionerId, patch);
  },
});
