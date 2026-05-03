import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// ── Documents ──────────────────────────────────────────────────────

export const getForPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .collect();

    return Promise.all(
      docs.map(async (doc) => {
        const url = await ctx.storage.getUrl(doc.storageId);
        return { ...doc, url };
      }),
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    documentType: v.union(
      v.literal("Retirement Notice"),
      v.literal("Authorization Letter"),
      v.literal("ID Card"),
      v.literal("Clearance Form"),
      v.literal("Verification Certificate"),
      v.literal("Death Certificate"),
    ),
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", args);
    await ctx.db.insert("auditLogs", {
      userId: args.uploadedBy,
      action: "DOCUMENT_UPLOADED",
      entityType: "pensioner",
      entityId: args.pensionerId,
      details: `${args.documentType}: ${args.filename}`,
    });
    return id;
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, { documentId, deletedBy }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(documentId);
    await ctx.db.insert("auditLogs", {
      userId: deletedBy,
      action: "DOCUMENT_DELETED",
      entityType: "pensioner",
      entityId: doc.pensionerId,
      details: `${doc.documentType}: ${doc.filename}`,
    });
  },
});

export const insert = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    documentType: v.union(
      v.literal("Retirement Notice"),
      v.literal("Authorization Letter"),
      v.literal("ID Card"),
      v.literal("Clearance Form"),
      v.literal("Verification Certificate"),
      v.literal("Death Certificate"),
    ),
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", args);

    await ctx.db.insert("auditLogs", {
      userId: args.uploadedBy,
      action: "DOCUMENT_UPLOADED",
      entityType: "document",
      entityId: id,
      details: `Uploaded ${args.documentType}: ${args.filename}`,
    });

    return id;
  },
});

export const listByPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return ctx.db
      .query("documents")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .collect();
  },
});
