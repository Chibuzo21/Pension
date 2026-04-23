"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ComplianceTrendChart } from "@/components/dashboard/ComplianceTrendChart";
import { BiometricLevelChart } from "@/components/dashboard/BiometricLevelChart";
import { RecentVerificationsTable } from "@/components/dashboard/RecentVerificationsTable";
import { RecentAuditLogs } from "@/components/dashboard/RecentAuditLogs";

export default function AdminDashboardPage() {
  const stats = useQuery(api.pensioners.getStats);
  const recentV = useQuery(api.verification.getRecent, { limit: 8 });
  const auditLogs = useQuery(api.users.getAuditLogs, { limit: 6 });
  const monthlyTrend = useQuery(api.verification.getMonthlyCompliance);
  const s = stats;

  return (
    <div className='md:p-5 p-2  overflow-x-hidden'>
      <div className='flex items-start justify-between mb-4 mt-2'>
        <div>
          <div className='text-2xl font-bold text-ink leading-tight'>
            Pension Dashboard
            <small className='block text-xs text-(--muted-foreground) font-normal mt-0.5'>
              📅 Real-time overview —{" "}
              {new Date().toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              })}
            </small>
          </div>
        </div>
        <div className='flex items-center gap-1 text-xs font-semibold text-g1 bg-g1/10 border border-(--g1)/30 px-2 py-1 rounded-full'>
          <span className='w-1.5 h-1.5 bg-g1 rounded-full animate-pulse'></span>
          Live
        </div>
      </div>

      {/* Stat row 1 */}
      <div className='grid lg:grid-cols-4 grid-cols-2 gap-3 mb-3'>
        <SC
          label='Total Pensioners'
          val={s?.total}
          change='↑ 312 new this month'
          up
        />
        <SC
          label='Verified This Month'
          val={s?.verifiedThisMonth}
          change={`${s?.complianceRate ?? 0}% compliance`}
          v='gold'
        />
        <SC
          label='Ghost Suspects Flagged'
          val={s?.flagged}
          change='↓ From pre-BPMLVS'
          v='red'
          dn
        />
        <SC
          label='Monthly Savings'
          val={`₦${s?.verifiedThisMonth ? Math.round(s.verifiedThisMonth * 0.015) : 0}M`}
          change='↑ Ghost elimination'
          up
          v='teal'
        />
      </div>

      {/* Stat row 2 */}
      <div className='grid  lg:grid-cols-4 grid-cols-2 gap-3 mb-3'>
        <SC
          label='Active Pensioners'
          val={s?.active}
          change={
            s?.total
              ? `${Math.round((s.active / s.total) * 100)}% of total`
              : ""
          }
          v='purple'
        />
        <SC
          label='Multi-Modal L3 Enrolled'
          val={s?.biometric?.l3}
          change='↑ Full face+voice'
          up
          v='gold'
        />
        <SC
          label='Face Only L1'
          val={s?.biometric?.l1l2}
          change='↓ Needs upgrade'
          v='orange'
        />
      </div>

      {/* Charts row */}
      <div className='grid sm:grid-cols-[2fr_1fr] gap-3 mb-3'>
        <div className='bg-white border border-mist rounded-[11px] box-shadow shadow-sm '>
          <div className='flex items-center justify-between px-4 py-2.5 border-b border-smoke'>
            <div className='text-xs font-bold text-ink'>
              📈 Monthly Compliance Trend
            </div>
            <span className='text-[10px] text-(--muted)'>Last 6 months</span>
          </div>
          <div className='p-3.5 h-43.75'>
            <ComplianceTrendChart data={monthlyTrend ?? []} />
          </div>
        </div>
        <div className='bg-white border border-mist rounded-[11px] shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-4 py-2.5 border-b border-smoke'>
            <div className='text-xs font-bold text-ink'>🎯 Compliance</div>
          </div>
          <div className='flex flex-col items-center p-3.5'>
            <div
              className='w-27.5 h-27.5 rounded-full flex items-center justify-center mb-2'
              style={
                {
                  background: `conic-gradient(var(--g1) ${s?.complianceRate ?? 0}%, var(--smoke) 0%)`,
                } as React.CSSProperties
              }>
              <div className='w-21 h-21 rounded-full bg-white flex flex-col items-center justify-center'>
                <div className='text-2xl font-black text-g1'>
                  {s?.complianceRate ?? 0}%
                </div>
                <div className='text-[8px] text-(--muted) font-semibold uppercase tracking-wider'>
                  Verified
                </div>
              </div>
            </div>
            <div className='font-bold text-xs mb-0.5'>
              {new Date().toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className='text-[10px] text-(--muted)'>
              {(s?.verifiedThisMonth ?? 0).toLocaleString()} of{" "}
              {(s?.active ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className='grid lg:grid-cols-2 gap-3'>
        <RecentVerificationsTable verifications={recentV ?? []} />
        <div className='flex flex-col gap-3'>
          <BiometricLevelChart
            data={s?.biometric ?? { l3: 0, l1l2: 0, l0: 0 }}
          />
          <RecentAuditLogs logs={auditLogs ?? []} />
        </div>
      </div>
    </div>
  );
}

function SC({
  label,
  val,
  change,
  v,
  up,
  dn,
}: {
  label: string;
  val?: number | string | null;
  change?: string;
  v?: string;
  up?: boolean;
  dn?: boolean;
}) {
  const display = typeof val === "number" ? val.toLocaleString() : (val ?? "—");
  return (
    <div className={`sc ${v ?? ""}`}>
      <div className='sc-lbl'>{label}</div>
      <div className='sc-val'>{display}</div>
      {change && (
        <div className={`sc-chg ${up ? "up" : dn ? "dn" : ""}`}>{change}</div>
      )}
    </div>
  );
}
