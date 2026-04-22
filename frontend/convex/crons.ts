import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "flag-overdue-pensioners",
  { hourUTC: 7, minuteUTC: 0 },
  internal.scheduler.flagOverduePensioners,
);

crons.weekly(
  "weekly-compliance-report",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.scheduler.sendWeeklyComplianceReport,
);

// 1st of every month at 8am WAT (7am UTC)
crons.monthly(
  "monthly-dormancy-check",
  { day: 1, hourUTC: 7, minuteUTC: 0 },
  internal.scheduler.checkDormantPensioners,
);

export default crons;
