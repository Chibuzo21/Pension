"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface V {
  _id: string;
  status: string;
  assuranceLevel?: string;
  fusedScore?: number;
  verificationDate: string;
  pensioner?: { _id: string; fullName: string; pensionId: string } | null;
}

const statusColors: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-orange-100 text-orange-700",
  MANUAL_OVERRIDE: "bg-blue-100 text-blue-700",
};

const levelColors: Record<string, string> = {
  L1: "bg-orange-100 text-orange-700",
  L2: "bg-blue-100 text-blue-700",
  L3: "bg-blue-100 text-blue-700",
};

export function RecentVerificationsTable({
  verifications,
}: {
  verifications: V[];
}) {
  return (
    <div className='bg-white border border-mist rounded-[11px] shadow-sm overflow-x-auto lg:overflow-x-hidden scrollbar'>
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-smoke'>
        <div className='text-xs font-bold text-ink'>
          📋 Recent Verifications
        </div>
        <Link href='/dashboard/admin/reports'>
          <button className='px-2 py-1 text-[9px] font-semibold border border-g1 text-g1 bg-transparent rounded hover:bg-g1/5 transition-colors'>
            View all →
          </button>
        </Link>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-xs'>
          <thead>
            <tr className='bg-g1 text-white'>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                Pensioner
              </th>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                Modalities
              </th>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                Fusion
              </th>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                Level
              </th>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                Status
              </th>
              <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                When
              </th>
            </tr>
          </thead>
          <tbody>
            {verifications.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='text-center text-muted-foreground py-4.5 px-2.5'>
                  No verifications yet
                </td>
              </tr>
            ) : (
              verifications.map((v) => (
                <tr
                  key={v._id}
                  className='border-b border-smoke hover:bg-offwhite'>
                  <td className='px-2.5 py-1.5'>
                    <Link
                      href={`/dashboard/admin/pensioners/${v.pensioner?._id}`}
                      className='no-underline'>
                      <div className='font-semibold text-xs text-ink'>
                        {v.pensioner?.fullName ?? "—"}
                      </div>
                      <code className='text-[9px] text-g1 font-mono'>
                        {v.pensioner?.pensionId}
                      </code>
                    </Link>
                  </td>
                  <td className='px-2.5 py-1.5 text-ink'>
                    {v.assuranceLevel === "L3"
                      ? "Face+FP+Voice"
                      : v.assuranceLevel === "L2"
                        ? "Face+Voice"
                        : v.assuranceLevel === "L1"
                          ? "Face+FP"
                          : "Face"}
                  </td>
                  <td className='px-2.5 py-1.5 font-mono font-bold text-g1'>
                    {v.fusedScore !== undefined
                      ? `${Math.round(v.fusedScore * 100)}%`
                      : "—"}
                  </td>
                  <td className='px-2.5 py-1.5'>
                    {v.assuranceLevel && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
                          levelColors[v.assuranceLevel] ??
                          "bg-slate-100 text-slate-700"
                        }`}>
                        {v.assuranceLevel}
                      </span>
                    )}
                  </td>
                  <td className='px-2.5 py-1.5'>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
                        statusColors[v.status] ?? "bg-slate-100 text-slate-700"
                      }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className='px-2.5 py-1.5 text-muted-foreground text-[10px]'>
                    {formatDistanceToNow(new Date(v.verificationDate), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
