import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// ── Users ──────────────────────────────────────────────────────────
//convex/users.ts
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").order("desc").collect();
  },
});

export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),

    role: v.optional(
      v.union(v.literal("admin"), v.literal("officer"), v.literal("pensioner")),
    ),
  },
  handler: async (ctx, { clerkId, email, username, role }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        username,

        lastLogin: new Date().toISOString(), // 👈 string, matches schema
        ...(role ? { role } : {}),
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      username,

      role: role ?? "pensioner",
      isActive: true,
      lastLogin: new Date().toISOString(), // 👈 string, matches schema
    });
    return userId;
  },
});
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("officer"),
      v.literal("pensioner"),
    ),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { userId, role, updatedByUserId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, { role });
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "USER_ROLE_CHANGED",
      entityType: "user",
      entityId: userId,
      details: `Role changed from ${user.role} to ${role}`,
    });
  },
});

export const toggleActive = mutation({
  args: {
    userId: v.id("users"),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { userId, updatedByUserId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const newState = !user.isActive;
    await ctx.db.patch(userId, { isActive: newState });
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: newState ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entityType: "user",
      entityId: userId,
      details: `User ${user.username} ${newState ? "activated" : "deactivated"}`,
    });
  },
});

export const linkToPensioner = mutation({
  args: {
    userId: v.id("users"),
    pensionerId: v.id("pensioners"),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, { userId, pensionerId, updatedByUserId }) => {
    await ctx.db.patch(userId, { pensionerId, role: "pensioner" });
    await ctx.db.insert("auditLogs", {
      userId: updatedByUserId,
      action: "USER_LINKED_TO_PENSIONER",
      entityType: "user",
      entityId: userId,
      details: `Linked to pensioner ${pensionerId}`,
    });
  },
});

// ── Audit Logs ─────────────────────────────────────────────────────

export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 100 }) => {
    const logs = await ctx.db.query("auditLogs").order("desc").take(limit);

    return Promise.all(
      logs.map(async (log) => {
        const user = log.userId ? await ctx.db.get(log.userId) : null;
        return { ...log, user };
      }),
    );
  },
});

export const insertAuditLog = mutation({
  args: {
    userId: v.optional(v.id("users")),
    username: v.optional(v.string()),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("auditLogs", args);
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
// convex/users.ts
export const syncRoleToClerk = action({
  args: { clerkId: v.string(), role: v.string() },
  handler: async (_, { clerkId, role }) => {
    const res = await fetch(
      `https://api.clerk.com/v1/users/${clerkId}/metadata`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_metadata: { role } }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Clerk PATCH failed: ${res.status} ${text}`);
    }
  },
});
// convex/users.ts
export const getByPensionerId = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_pensionerId", (q) => q.eq("pensionerId", pensionerId))
      .first();
  },
});
