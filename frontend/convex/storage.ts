import { mutation } from "./_generated/server";

/**
 * Generates a short-lived Convex storage upload URL.
 * Called by /api/storage/upload-url — only authenticated users reach that
 * route, so no extra auth check is needed here.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
