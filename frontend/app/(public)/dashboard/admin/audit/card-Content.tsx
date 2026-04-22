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
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/30'>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  id={header}
                  className='text-left text-xs font-semibold text-muted-foreground px-4 py-2.5'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-border/60'>
            {logs === undefined
              ? [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <Skeleton className='h-3.5 w-full' />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.map((log) => (
                  <tr
                    key={log._id}
                    className='hover:bg-muted/30 transition-colors'>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <p className='text-xs font-mono text-muted-foreground'>
                        {format(
                          new Date(log._creationTime),
                          "dd MMM · HH:mm:ss",
                        )}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-xs font-medium'>
                        {log.user?.username ?? log.username ?? "System"}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          ACTION_COLORS[log.action] ??
                            "text-gray-600 bg-gray-100",
                        )}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <p className='text-xs text-muted-foreground truncate max-w-70'>
                        {log.details ?? "—"}
                      </p>
                    </td>
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      <p className='text-xs font-mono text-muted-foreground'>
                        {log.ipAddress ?? "—"}
                      </p>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  );
}
