import { CardContent } from "@/components/ui/card";
import React, { useState, useMemo } from "react";
import { ACTION_COLORS } from "./colors";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";

function formatAction(action: string) {
  return action.charAt(0) + action.slice(1).toLowerCase();
}

function initials(name: string) {
  return (name || "S")[0].toUpperCase();
}

const ALL_ACTIONS = "all";

export default function AuditContent() {
  const logs = useQuery(api.users.getAuditLogs, { limit: 200 });
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(ALL_ACTIONS);

  const actionTypes = useMemo(() => {
    if (!logs) return [];
    return [ALL_ACTIONS, ...Array.from(new Set(logs.map((l) => l.action)))];
  }, [logs]);

  const actionCounts = useMemo(() => {
    if (!logs) return {} as Record<string, number>;
    return logs.reduce(
      (acc, l) => ({ ...acc, [l.action]: (acc[l.action] ?? 0) + 1 }),
      {} as Record<string, number>,
    );
  }, [logs]);

  const filtered = useMemo(() => {
    if (!logs) return [];
    const q = search.toLowerCase();
    return logs.filter((l) => {
      const matchFilter =
        activeFilter === ALL_ACTIONS || l.action === activeFilter;
      const matchSearch =
        !q ||
        (l.user?.username ?? l.username ?? "").toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.details ?? "").toLowerCase().includes(q) ||
        (l.ipAddress ?? "").includes(q);
      return matchFilter && matchSearch;
    });
  }, [logs, search, activeFilter]);

  const stats = useMemo(() => {
    if (!logs) return null;
    const topAction = Object.entries(actionCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];
    return {
      total: logs.length,
      noIp: logs.filter((l) => !l.ipAddress).length,
      uniqueUsers: new Set(
        logs.map((l) => l.user?.username ?? l.username ?? "System"),
      ).size,
      topAction: topAction ? formatAction(topAction[0]) : "—",
    };
  }, [logs, actionCounts]);

  return (
    <CardContent className='px-0 pb-0'>
      {/* Stats Row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 border-b border-smoke'>
        {stats ? (
          <>
            {[
              { label: "Total events", value: stats.total },
              { label: "Top action", value: stats.topAction, truncate: true },
              {
                label: "No IP logged",
                value: stats.noIp,
                highlight: stats.noIp > 0,
              },
              { label: "Unique users", value: stats.uniqueUsers },
            ].map(({ label, value, highlight, truncate }) => (
              <div
                key={label}
                className='bg-offwhite rounded-lg px-3 py-2.5 flex flex-col gap-1'>
                <span className='text-[9px] uppercase tracking-[0.4px] font-semibold text-slate'>
                  {label}
                </span>
                <span
                  className={cn(
                    "text-xl font-semibold",
                    highlight ? "text-red-600" : "text-ink",
                    truncate && "text-sm truncate w-full block",
                  )}>
                  {value}
                </span>
              </div>
            ))}
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-14 rounded-lg bg-smoke' />
          ))
        )}
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2 px-4 py-3 border-b border-smoke'>
        <div className='relative flex-1 min-w-40'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate' />
          <input
            type='text'
            placeholder='Search user, action, details…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg border border-smoke bg-offwhite text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-g1/40 focus:border-g1'
          />
        </div>
        <div className='flex gap-1.5 flex-wrap'>
          {actionTypes.map((action) => (
            <button
              key={action}
              onClick={() => setActiveFilter(action)}
              className={cn(
                "text-[10px] font-medium px-3 py-1 rounded-full border transition-all",
                activeFilter === action
                  ? "bg-g1 text-white border-g1"
                  : "bg-offwhite text-slate border-smoke hover:border-g1/50",
              )}>
              {action === ALL_ACTIONS ? "All" : formatAction(action)}
              <span
                className={cn(
                  "ml-1.5 text-[9px] px-1.5 py-px rounded-full",
                  activeFilter === action
                    ? "bg-white/20 text-white"
                    : "bg-smoke text-slate",
                )}>
                {action === ALL_ACTIONS
                  ? (logs?.length ?? 0)
                  : (actionCounts[action] ?? 0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm min-w-130'>
          <thead>
            <tr className='bg-g1'>
              {["Timestamp", "User", "Action", "Details", "IP Address"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "text-left text-[9px] font-semibold tracking-[0.4px] uppercase px-4 py-2.5 text-white/90",
                      i === 3 && "hidden sm:table-cell",
                      i === 4 && "hidden md:table-cell",
                    )}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {logs === undefined ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className='border-b border-smoke'>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className='px-4 py-3'>
                      <Skeleton className='h-3 w-full rounded-md bg-smoke animate-pulse' />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className='text-center py-12 text-[12px] text-slate'>
                  No logs match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((log, idx) => {
                const username = log.user?.username ?? log.username ?? "System";
                return (
                  <tr
                    key={log._id}
                    className={cn(
                      "border-b border-smoke transition-colors duration-100",
                      idx % 2 === 0 ? "bg-white" : "bg-offwhite",
                      "hover:bg-[#f0faf0]",
                    )}>
                    {/* Timestamp */}
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='font-mono text-[10px] text-slate'>
                        {format(
                          new Date(log._creationTime),
                          "dd MMM · HH:mm:ss",
                        )}
                      </span>
                    </td>

                    {/* User */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-md bg-g1 text-white text-[9px] font-bold flex items-center justify-center shrink-0'>
                          {initials(username)}
                        </div>
                        <span className='text-[11px] font-medium text-ink truncate max-w-[80px] sm:max-w-none'>
                          {username}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          "inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.3px]",
                          ACTION_COLORS[log.action] ??
                            "bg-[#f1f5f9] text-[#475569]",
                        )}>
                        {formatAction(log.action)}
                      </span>
                    </td>

                    {/* Details - hidden on mobile */}
                    <td className='px-4 py-3 hidden sm:table-cell max-w-[200px]'>
                      <p
                        className='text-[10.5px] text-slate truncate'
                        title={log.details ?? ""}>
                        {log.details ?? "—"}
                      </p>
                    </td>

                    {/* IP - hidden on mobile + tablet */}
                    <td className='px-4 py-3 hidden md:table-cell'>
                      {log.ipAddress ? (
                        <span className='font-mono text-[10px] text-slate'>
                          {log.ipAddress}
                        </span>
                      ) : (
                        <span className='text-[10px] text-slate/50 italic'>
                          not captured
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  );
}
