"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, statusBadge, biometricLevelBadge } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { useConvexUser } from "@/lib/useConvexUser";
import {
  AlertTriangle,
  Clock,
  ShieldX,
  Download,
  Mail,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { exportCSV } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  deceased: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  suspended: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  flagged: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const BIO_STYLES: Record<string, string> = {
  L3: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  L2: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  L1: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  L0: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accent: "amber" | "red" | "green" | "purple" | "blue";
}) {
  const accentMap = {
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className='bg-white border border-smoke rounded-xl p-4 flex flex-col gap-3 min-w-0'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-[11px] font-medium text-slate truncate'>
          {label}
        </span>
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            accentMap[accent],
          )}>
          {icon}
        </div>
      </div>
      <div>
        <p className='text-2xl font-bold text-ink leading-none'>{value}</p>
        <p className='text-[10px] text-slate mt-1'>{sub}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [threshold, setThreshold] = useState(37);
  const { convexUserId } = useConvexUser();
  const overdue = useQuery(api.verification.getOverdue, {
    daysThreshold: threshold,
  });
  const stats = useQuery(api.pensioners.getStats);
  const sendReminders = useAction(api.notifications.sendBulkReminders);
  const isLoading = overdue === undefined;

  const handleReminders = async () => {
    const ids = overdue!.map((p) => p._id);
    const result = await sendReminders({
      pensionerIds: ids,
      message:
        "Your pension verification is overdue. Please visit your nearest MDA office to complete verification and continue receiving your pension.",
      sentByUserId: convexUserId as Id<"users">,
    });
    result.failed > 0
      ? toast.warning(`${result.sent} sent, ${result.failed} failed`)
      : toast.success(`${result.sent} reminders sent`);
  };

  return (
    <div className='flex flex-col gap-5 p-4 sm:p-5 min-w-0'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h2 className='text-base font-bold text-ink'>Monthly Reports</h2>
          <p className='text-[11px] text-slate mt-0.5'>
            {format(new Date(), "MMMM yyyy")} · Compliance overview
          </p>
        </div>
        <button
          onClick={() => exportCSV(overdue ?? [])}
          disabled={!overdue?.length}
          className='flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-smoke rounded-lg text-slate hover:text-ink hover:border-g1/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start sm:self-auto'>
          <Download className='h-3.5 w-3.5' />
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0'>
        <StatCard
          icon={<AlertTriangle className='h-3.5 w-3.5' />}
          label='Overdue'
          value={isLoading ? "—" : (overdue?.length ?? 0).toLocaleString()}
          sub='Not verified 37+ days'
          accent='amber'
        />
        <StatCard
          icon={<ShieldX className='h-3.5 w-3.5' />}
          label='Failed This Month'
          value={
            isLoading ? "—" : (stats?.failedThisMonth ?? 0).toLocaleString()
          }
          sub='Requires investigation'
          accent='red'
        />
        <StatCard
          icon={<TrendingUp className='h-3.5 w-3.5' />}
          label='Verified This Month'
          value={
            isLoading ? "—" : (stats?.verifiedThisMonth ?? 0).toLocaleString()
          }
          sub={`${stats?.complianceRate ?? 0}% compliance`}
          accent='green'
        />
        <StatCard
          icon={<Users className='h-3.5 w-3.5' />}
          label='Pending L0 Upgrade'
          value={isLoading ? "—" : (stats?.biometric.l0 ?? 0).toLocaleString()}
          sub='No biometrics enrolled'
          accent='purple'
        />
      </div>

      {/* Overdue table card */}
      <div className='bg-white border border-smoke rounded-xl overflow-hidden min-w-0'>
        {/* Card header */}
        <div className='px-4 py-3 border-b border-smoke flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
          <div className='flex items-center gap-2 flex-wrap'>
            <AlertTriangle className='h-4 w-4 text-amber-500 shrink-0' />
            <span className='text-sm font-semibold text-ink'>
              Not verified in
            </span>
            <input
              type='number'
              min={1}
              max={365}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className='w-14 text-xs border border-smoke rounded-lg px-2 py-1 text-ink text-center focus:outline-none focus:ring-1 focus:ring-g1/40 focus:border-g1'
            />
            <span className='text-sm font-semibold text-ink'>+ days</span>
            {!isLoading && (
              <span className='text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full font-semibold'>
                {overdue?.length ?? 0} records
              </span>
            )}
          </div>

          {!isLoading && (overdue?.length ?? 0) > 0 && (
            <button
              onClick={handleReminders}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-smoke rounded-lg text-slate hover:text-ink hover:border-g1/40 transition-colors self-start sm:self-auto shrink-0'>
              <Mail className='h-3.5 w-3.5' />
              Send Reminders
            </button>
          )}
        </div>

        {/* Body */}
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col gap-2 p-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 rounded-lg bg-smoke' />
              ))}
            </div>
          ) : !overdue || overdue.length === 0 ? (
            <div className='text-center py-14 text-sm text-slate'>
              <div className='text-2xl mb-2'>🎉</div>
              No overdue pensioners — excellent compliance!
            </div>
          ) : (
            <table className='w-full text-xs min-w-[540px]'>
              <thead>
                <tr className='bg-g1'>
                  {[
                    "Pensioner",
                    "MDA",
                    "Status",
                    "Bio Level",
                    "Last Verified",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-4 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-white/80 whitespace-nowrap",
                        i === 1 && "hidden md:table-cell",
                        i === 3 && "hidden lg:table-cell",
                      )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdue.map((p, idx) => (
                  <tr
                    key={p._id}
                    className={cn(
                      "border-b border-smoke transition-colors hover:bg-[#f0faf0]",
                      idx % 2 === 0 ? "bg-white" : "bg-offwhite/50",
                    )}>
                    {/* Pensioner */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2.5'>
                        <div className='w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold shrink-0'>
                          {p.fullName
                            .split(" ")
                            .slice(0, 2)
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div className='min-w-0'>
                          <p className='font-semibold text-[11px] text-ink truncate'>
                            {p.fullName}
                          </p>
                          <p className='text-[10px] font-mono text-slate'>
                            {p.pensionId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* MDA */}
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <span className='text-[11px] text-slate truncate max-w-[120px] block'>
                        {p.lastMda ?? "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize",
                          STATUS_STYLES[p.status] ??
                            "bg-slate-100 text-slate-600",
                        )}>
                        {p.status}
                      </span>
                    </td>

                    {/* Bio level */}
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold",
                          BIO_STYLES[p.biometricLevel ?? "L0"],
                        )}>
                        {p.biometricLevel ?? "L0"}
                      </span>
                    </td>

                    {/* Last verified */}
                    <td className='px-4 py-3'>
                      <span className='text-[10px] text-amber-600 font-medium flex items-center gap-1'>
                        <Clock className='h-3 w-3 shrink-0' />
                        {p.lastVerification
                          ? formatDistanceToNow(
                              new Date(p.lastVerification.verificationDate),
                              { addSuffix: true },
                            )
                          : "Never verified"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className='px-4 py-3'>
                      <Link
                        href={`/dashboard/admin/pensioners/${p._id}/verify`}
                        className='flex items-center gap-0.5 text-[10px] font-semibold text-g1 hover:underline whitespace-nowrap'>
                        Verify
                        <ChevronRight className='h-3 w-3' />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
