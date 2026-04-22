import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { Resend } from "resend";
import { api } from "./_generated/api";

// Query to fetch notifications
// ── Notifications ──────────────────────────────────────────────────

export const getForPensioner = query({
  args: { pensionerId: v.id("pensioners") },
  handler: async (ctx, { pensionerId }) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_pensioner", (q) => q.eq("pensionerId", pensionerId))
      .order("desc")
      .take(20);
  },
});

export const sendBulkReminders = action({
  args: {
    pensionerIds: v.array(v.id("pensioners")),
    message: v.string(),
    sentByUserId: v.id("users"),
  },
  handler: async (ctx, { pensionerIds, message, sentByUserId }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = { sent: 0, failed: 0 };

    for (const pensionerId of pensionerIds) {
      try {
        // 1. Fetch the pensioner's details
        const pensioner = await ctx.runQuery(api.pensioners.getById, {
          id: pensionerId,
        });

        if (!pensioner?.email) {
          results.failed++;
          continue;
        }

        // 2. Send the email via Resend
        await resend.emails.send({
          from: "BPMLVS Verification <noreply@yourdomain.com>",
          to: pensioner?.email,
          subject: "Action Required: Pension Verification Overdue",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verification Reminder</h2>
              <p>Dear ${pensioner.fullName},</p>
              <p>${message}</p>
              <p>Please visit your nearest MDA office or use the self-service portal to complete your verification.</p>
              <p style="color: #888; font-size: 12px;">
                Pension ID: ${pensioner.pensionId}<br/>
                This is an automated message from the BPMLVS system.
              </p>
            </div>
          `,
        });

        // 3. Record the notification in the DB
        await ctx.runMutation(api.notifications.recordNotification, {
          pensionerId,
          type: "OVERDUE_REMINDER",
          status: "SENT",
          message,
        });

        results.sent++;
      } catch (err) {
        console.error(`Failed to send reminder for ${pensionerId}:`, err);

        // Record the failure too
        await ctx.runMutation(api.notifications.recordNotification, {
          pensionerId,
          type: "OVERDUE_REMINDER",
          status: "FAILED",
          message,
        });

        results.failed++;
      }
    }

    return results;
  },
});
export const recordNotification = mutation({
  args: {
    pensionerId: v.id("pensioners"),
    type: v.union(
      v.literal("VERIFICATION_FAILED"),
      v.literal("VERIFICATION_SUCCESS"),
      v.literal("OVERDUE_REMINDER"),
      v.literal("STATUS_CHANGE"),
      v.literal("BULK"),
    ),
    status: v.union(
      v.literal("SENT"),
      v.literal("FAILED"),
      v.literal("PENDING"),
    ),
    recipientEmail: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("notifications", {
      ...args,
      sentAt: new Date().toISOString(),
    });
  },
});
