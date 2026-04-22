import { internalAction, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

export const sendWeeklyComplianceReport = internalAction({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.runQuery(api.pensioners.getStats, {});
    console.log(
      `[Scheduler] Weekly compliance: ${stats.complianceRate}% verified this month. ` +
        `Total: ${stats.total}, Active: ${stats.active}`,
    );
    // In production: email admins the full stats
  },
});
export const flagOverduePensioners = internalAction({
  args: {},
  handler: async (ctx) => {
    const overdue = await ctx.runQuery(api.verification.getOverdue, {
      daysThreshold: 37,
    });

    let flagged = 0;
    for (const pensioner of overdue ?? []) {
      if (pensioner && pensioner.status === "active") {
        // In production you'd also send email reminders here
        // await sendEmail(pensioner.email, "Your pension verification is overdue");
        flagged++;
      }
    }

    console.log(
      `[Scheduler] Overdue check complete. ${flagged} pensioners overdue.`,
    );
  },
});
/**
 * Monthly dormancy check.
 * - Active pensioners who haven't verified in 35+ days → increment missedVerificationCount
 * - 1 missed month  → status stays "active" but missedVerificationCount = 1 (officer can see)
 * - 2+ missed months → status → "dormant" (portal access blocked, officer must investigate)
 * - Already dormant pensioners are skipped — they need manual resolution
 */
export const checkDormantPensioners = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 35 days to give a small grace window around month boundaries
    const cutoff = Date.now() - 35 * 24 * 60 * 60 * 1000;

    const active = await ctx.db
      .query("pensioners")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    let flagged = 0;
    let suspended = 0;

    for (const p of active) {
      const lastVerified = p.lastVerifiedAt ?? 0;
      if (lastVerified >= cutoff) continue; // verified recently, skip

      const missed = (p.missedVerificationCount ?? 0) + 1;

      await ctx.db.patch(p._id, {
        missedVerificationCount: missed,
        ...(missed >= 2 ? { status: "dormant" } : {}),
      });

      if (missed >= 2) {
        suspended++;
        // Log an audit event so officers can see why status changed
        await ctx.db.insert("auditLogs", {
          action: "AUTO_DORMANT",
          entityType: "pensioner",
          entityId: p._id,
          details: `Missed ${missed} consecutive monthly verifications`,
        });
      } else {
        flagged++;
      }
    }

    console.log(
      `[dormancy] checked ${active.length} pensioners — flagged: ${flagged}, suspended: ${suspended}`,
    );
  },
});
