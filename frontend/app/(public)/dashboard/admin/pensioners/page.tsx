"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const STATUS_FILTERS = ["All", "ACTIVE", "DECEASED", "SUSPENDED", "FLAGGED"];

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

  // Only default to [] after we know loading is done
  const pensioners = isSearching ? (searchResults ?? []) : paged;

  return (
    <div className='flex flex-col h-[calc(100vh-50px)]'>
      {/* Filter bar */}
      <div className='px-5 py-3.5 border-b border-smoke bg-white flex flex-col gap-3'>
        <h2 className='text-base font-bold'>
          👥 All Pensioners{" "}
          <small className='text-xs text-muted-foreground font-normal'>
            {loading ? "loading…" : `${pensioners.length} records`}
          </small>
        </h2>
        <div className='flex gap-1.5 items-center flex-wrap'>
          <input
            className='flex-1 min-w-45 px-3 py-1.5 text-xs border border-mist rounded-lg placeholder:text-muted-foreground  text-ink focus:outline-none focus:ring-1 focus:ring-g1'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type='text'
            placeholder='🔍 Search name, ID, MDA…'
          />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                statusFilter === s
                  ? "bg-g1 text-white"
                  : "bg-smoke text-ink hover:bg--mist"
              }`}
              onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
          <Link href='/dashboard/admin/pensioners/new'>
            <button className='px-3 py-1.5 text-xs font-bold bg-g1 text-white rounded hover:bg-g2 transition-colors'>
              ➕ Register New
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className='flex-1 overflow-auto px-5 py-3.5'>
        <div className='bg-white border border-mist rounded-[11px] overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-xs'>
              <thead>
                <tr className='bg-g1 text-white'>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Pension ID
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    MDA
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Bio Level
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Last Verified
                  </th>
                  <th className='px-2.5 py-1.5 text-left font-semibold text-[9px] uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr
                      key={i}
                      className='border-b border-smoke hover:bg-offwhite'>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className='px-2.5 py-1.5'>
                          <div className='h-3 bg-smoke rounded w-4/5' />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pensioners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className='text-center text-muted-foreground py-7 px-2.5'>
                      No pensioners found
                    </td>
                  </tr>
                ) : (
                  pensioners.map((p) => {
                    const lv = p.lastVerifiedAt;
                    const isOverdue =
                      !p.lastVerifiedAt ||
                      p.lastVerifiedAt < Date.now() - 37 * 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={p._id}
                        className='border-b border-smoke hover:bg-offwhite'>
                        <td className='px-2.5 py-1.5'>
                          <code className='text-[9px] text-g1 font-mono'>
                            {p.pensionId}
                          </code>
                        </td>
                        <td className='px-2.5 py-1.5 font-semibold text-ink'>
                          {p.fullName}
                        </td>
                        <td className='px-2.5 py-1.5 text-xs text-slate'>
                          {p.lastMda ?? "—"}
                        </td>
                        <td className='px-2.5 py-1.5'>
                          <span
                            className={`inline-block px-2 py-1 rounded text-[9px] font-semibold ${
                              p.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : p.status === "deceased"
                                  ? "bg-slate-100 text-slate-700"
                                  : p.status === "suspended"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className='px-2.5 py-1.5'>
                          <span
                            className={`inline-block px-2 py-1 rounded text-[9px] font-semibold ${
                              p.biometricLevel === "L3"
                                ? "bg-emerald-100 text-emerald-700"
                                : p.biometricLevel === "L1" ||
                                    p.biometricLevel === "L2"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}>
                            {p.biometricLevel}
                          </span>
                        </td>
                        <td>
                          {p.lastVerifiedAt ? (
                            formatDistanceToNow(new Date(p.lastVerifiedAt), {
                              addSuffix: true,
                            })
                          ) : (
                            <span className='text-orange-600'>
                              Never verified
                            </span>
                          )}
                        </td>
                        <td className='px-2.5 py-1.5'>
                          <div className='flex gap-1'>
                            <Link href={`/dashboard/admin/pensioners/${p._id}`}>
                              <button className='px-1.5 py-0.5 text-[9px] font-semibold border border-g1 text-g1 bg-transparent rounded hover:bg-g1/5 transition-colors'>
                                View
                              </button>
                            </Link>
                            <Link
                              href={`/dashboard/admin/pensioners/${p._id}/enroll`}>
                              <button className='px-1.5 py-0.5 text-[9px] font-semibold bg-g1 text-white rounded hover:bg-g2 transition-colors'>
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
          <div className='px-3.5 py-2 flex items-center justify-between border-t border-smoke text-[10px] text-muted-foreground bg-offwhite'>
            <span>
              {loading ? "Loading…" : `Showing ${pensioners.length} records`}
            </span>
            {!q && status === "CanLoadMore" && (
              <div className='flex gap-1'>
                <button
                  className='px-3 py-1 text-xs font-semibold border border-g1 text-g1 bg-transparent rounded hover:bg-g1/5 transition-colors'
                  onClick={() => loadMore(20)}>
                  Load more →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
