"use client";

import { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Search, Plus, ChevronRight, Users } from "lucide-react";

const STATUS_FILTERS = ["All", "active", "deceased", "suspended", "flagged"];

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

function SkeletonRow() {
  return (
    <tr className='border-b border-smoke'>
      {Array.from({ length: 7 }).map((_, j) => (
        <td key={j} className='px-3 py-3'>
          <div className='h-3 bg-smoke rounded-md animate-pulse w-4/5' />
        </td>
      ))}
    </tr>
  );
}

export default function PensionersPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isSearching = q.length > 1;

  const searchResults = useQuery(
    api.pensioners.search,
    isSearching
      ? { query: q, status: statusFilter !== "All" ? statusFilter : undefined }
      : "skip",
  );

  const {
    results: paged,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.pensioners.list,
    { status: statusFilter !== "All" ? statusFilter : undefined },
    { initialNumItems: 20 },
  );

  const loading = isSearching
    ? searchResults === undefined
    : status === "LoadingFirstPage";

  const pensioners = isSearching ? (searchResults ?? []) : paged;

  return (
    <div className='flex flex-col gap-4 p-4 sm:p-5'>
      {/* Header */}
      <div className='flex items-start justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded-lg bg-g1 flex items-center justify-center shrink-0'>
            <Users className='w-4 h-4 text-white' />
          </div>
          <div>
            <h2 className='text-base font-bold text-ink leading-tight'>
              Pensioners
            </h2>
            <p className='text-[11px] text-slate mt-px'>
              {loading ? "Loading records…" : `${pensioners.length} records`}
            </p>
          </div>
        </div>
        <Link href='/dashboard/admin/pensioners/new'>
          <button className='flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-g1 text-white rounded-lg hover:bg-g2 transition-colors shrink-0'>
            <Plus className='w-3.5 h-3.5' />
            Register New
          </button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
        <div className='relative flex-1 min-w-0'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate pointer-events-none' />
          <input
            className='w-full pl-8 pr-3 py-2 text-xs border border-smoke rounded-lg bg-white text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-g1/40 focus:border-g1 transition-colors'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type='text'
            placeholder='Search name, ID, MDA…'
          />
        </div>
        <div className='flex gap-1.5 flex-wrap'>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all",
                statusFilter === s
                  ? "bg-g1 text-white border-g1"
                  : "bg-white text-slate border-smoke hover:border-g1/40 hover:text-ink",
              )}>
              {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className='bg-white border border-smoke rounded-xl overflow-hidden shadow-sm min-w-0'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-xs min-w-160'>
            <thead>
              <tr className='bg-g1'>
                {[
                  "Pension ID",
                  "Name",
                  "MDA",
                  "Status",
                  "Bio Level",
                  "Last Verified",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className='px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-white/80 whitespace-nowrap'>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pensioners.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='text-center text-slate py-12 text-xs'>
                    <div className='flex flex-col items-center gap-2'>
                      <Users className='w-8 h-8 text-smoke' />
                      <span>No pensioners found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pensioners.map((p, idx) => {
                  const isOverdue =
                    !p.lastVerifiedAt ||
                    p.lastVerifiedAt < Date.now() - 37 * 24 * 60 * 60 * 1000;

                  return (
                    <tr
                      key={p._id}
                      className={cn(
                        "border-b border-smoke transition-colors duration-100 hover:bg-[#f0faf0]",
                        idx % 2 === 0 ? "bg-white" : "bg-offwhite/50",
                      )}>
                      {/* Pension ID */}
                      <td className='px-3 py-2.5'>
                        <code className='text-[10px] text-g1 font-mono font-semibold'>
                          {p.pensionId}
                        </code>
                      </td>

                      {/* Name */}
                      <td className='px-3 py-2.5'>
                        <span className='text-[11px] font-semibold text-ink'>
                          {p.fullName}
                        </span>
                      </td>

                      {/* MDA */}
                      <td className='px-3 py-2.5'>
                        <span className='text-[11px] text-slate truncate max-w-[120px] block'>
                          {p.lastMda ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className='px-3 py-2.5'>
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize",
                            STATUS_STYLES[p.status] ??
                              "bg-slate-100 text-slate-600",
                          )}>
                          {p.status}
                        </span>
                      </td>

                      {/* Bio Level */}
                      <td className='px-3 py-2.5'>
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold",
                            BIO_STYLES[p.biometricLevel ?? "L0"],
                          )}>
                          {p.biometricLevel ?? "L0"}
                        </span>
                      </td>

                      {/* Last Verified */}
                      <td className='px-3 py-2.5'>
                        {p.lastVerifiedAt ? (
                          <span
                            className={cn(
                              "text-[10px]",
                              isOverdue ? "text-orange-500" : "text-slate",
                            )}>
                            {formatDistanceToNow(new Date(p.lastVerifiedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        ) : (
                          <span className='text-[10px] text-orange-500 font-medium'>
                            Never verified
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className='px-3 py-2.5'>
                        <div className='flex items-center gap-1.5'>
                          <Link href={`/dashboard/admin/pensioners/${p._id}`}>
                            <button className='px-2 py-1 text-[9px] font-semibold border border-g1/30 text-g1 rounded-md hover:bg-g1/5 transition-colors'>
                              View
                            </button>
                          </Link>
                          <Link
                            href={`/dashboard/admin/pensioners/${p._id}/enroll`}>
                            <button className='px-2 py-1 text-[9px] font-semibold bg-g1 text-white rounded-md hover:bg-g2 transition-colors'>
                              Enroll
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className='px-4 py-2.5 flex items-center justify-between border-t border-smoke bg-offwhite/60'>
          <span className='text-[10px] text-slate'>
            {loading ? "Loading…" : `${pensioners.length} records`}
          </span>
          {!isSearching && status === "CanLoadMore" && (
            <button
              onClick={() => loadMore(20)}
              className='flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold border border-g1/30 text-g1 rounded-lg hover:bg-g1/5 transition-colors'>
              Load more
              <ChevronRight className='w-3 h-3' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
