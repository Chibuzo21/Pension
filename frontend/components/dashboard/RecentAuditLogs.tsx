"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Doc } from "@/convex/_generated/dataModel";

const actionColors: Record<string, string> = {
  PENSIONER_CREATED: "bg-emerald-100 text-emerald-700",
  PENSIONER_UPDATED: "bg-blue-100 text-blue-700",
  STATUS_CHANGED: "bg-amber-100 text-amber-700",
  VERIFICATION_VERIFIED: "bg-emerald-100 text-emerald-700",
  VERIFICATION_FAILED: "bg-red-100 text-red-700",
  VERIFICATION_OVERRIDDEN: "bg-purple-100 text-purple-700",
  BIOMETRIC_UPDATED: "bg-blue-100 text-blue-700",
  USER_ACTIVATED: "bg-emerald-100 text-emerald-700",
  USER_DEACTIVATED: "bg-red-100 text-red-700",
  DOCUMENT_UPLOADED: "bg-blue-100 text-blue-700",
};
type AuditLogWithUser = Doc<"auditLogs"> & {
  user: Doc<"users"> | null;
};

function fmt(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RecentAuditLogs({ logs }: { logs: AuditLogWithUser[] }) {
  return (
    <div className='bg-white border border-mist rounded-[11px] shadow-sm overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-smoke'>
        <div className='text-xs font-bold text-ink'>📜 Audit Trail</div>
        <Link href='/dashboard/admin/audit'>
          <button className='px-2 py-1 text-[9px] font-semibold border border-g1 text-g1 bg-transparent rounded hover:bg-g1/5 transition-colors'>
            View all →
          </button>
        </Link>
      </div>
      <div className='px-3.5 py-2'>
        {logs.length === 0 ? (
          <p className='text-xs text-muted text-center py-3'>No audit logs</p>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className='flex items-center gap-1.5 px-0 py-1.5 border-b border-smoke text-[8px] last:border-b-0'>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                  actionColors[log.action] ?? "bg-slate-100 text-slate-700"
                }`}>
                {fmt(log.action)}
              </span>
              <span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-slate'>
                {log.details ?? log.user?.username ?? "System"}
              </span>
              <span className='text-muted-foreground whitespace-nowrap shrink-0'>
                {formatDistanceToNow(new Date(log._creationTime), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
