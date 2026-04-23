import { CardContent } from "@/components/ui/card";
import React from "react";
import { ACTION_COLORS } from "./colors";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const tableHeaders = ["Timestamp", "User", "Action", "Details", "IP Address"];

export default function AuditContent() {
  const logs = useQuery(api.users.getAuditLogs, { limit: 200 });

  return (
    <CardContent className='px-0 pb-0'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className='bg-[var(--g1)] text-white text-left text-[9px] font-semibold tracking-[0.4px] uppercase px-4 py-2.5 first:rounded-tl-none last:rounded-tr-none'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs === undefined
              ? [...Array(10)].map((_, i) => (
                  <tr key={i} className='border-b border-[var(--smoke)]'>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <Skeleton className='h-3 w-full rounded-md bg-[var(--smoke)] animate-pulse' />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.map((log, idx) => (
                  <tr
                    key={log._id}
                    className={cn(
                      "border-b border-[var(--smoke)] transition-colors duration-100",
                      idx % 2 === 0 ? "bg-white" : "bg-[var(--offwhite)]",
                      "hover:bg-[#f0faf0]",
                    )}>
                    {/* Timestamp */}
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='font-mono text-[10px] text-[var(--slate)]'>
                        {format(
                          new Date(log._creationTime),
                          "dd MMM · HH:mm:ss",
                        )}
                      </span>
                    </td>

                    {/* User */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-5 h-5 rounded-md bg-[var(--g1)] text-white text-[9px] font-bold flex items-center justify-center shrink-0'>
                          {(log.user?.username ??
                            log.username ??
                            "S")[0].toUpperCase()}
                        </div>
                        <span className='text-[11px] font-medium text-[var(--ink)]'>
                          {log.user?.username ?? log.username ?? "System"}
                        </span>
                      </div>
                    </td>

                    {/* Action badge */}
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          "inline-block text-[9px] font-bold px-2 py-0.5 rounded-[8px] uppercase tracking-[0.3px]",
                          ACTION_COLORS[log.action] ??
                            "bg-[#f1f5f9] text-[#475569]",
                        )}>
                        {formatAction(log.action)}
                      </span>
                    </td>

                    {/* Details */}
                    <td className='px-4 py-3 hidden md:table-cell max-w-[260px]'>
                      <p className='text-[10.5px] text-[var(--slate)] truncate'>
                        {log.details ?? "—"}
                      </p>
                    </td>

                    {/* IP */}
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <span className='font-mono text-[10px] text-[var(--slate)]'>
                        {log.ipAddress ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  );
}
