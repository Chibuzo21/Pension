"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { cn, statusBadge, biometricLevelBadge } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { useConvexUser } from "@/lib/useConvexUser";

import {
  AlertTriangle,
  Clock,
  ShieldX,
  Download,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import SummaryCard from "@/components/reports/SummaryCard";
import { exportCSV } from "@/lib/utils";

export default function ReportsPage() {
  // const overdue = useQuery(api.verification.getOverdue, { daysThreshold: 37 });
  const [threshold, setThreshold] = useState(37);

  const { convexUserId } = useConvexUser();

  const overdue = useQuery(api.verification.getOverdue, {
    daysThreshold: threshold,
  });
  const stats = useQuery(api.pensioners.getStats);

  const sendReminders = useAction(api.notifications.sendBulkReminders);
  const handleReminders = async () => {
    const ids = overdue!.map((p) => p._id);
    const result = await sendReminders({
      pensionerIds: ids,
      message:
        "Your pension verification is overdue. Please visit your nearest MDA office to complete verification and continue receiving your pension.",
      sentByUserId: convexUserId as Id<"users">,
    });

    if (result.failed > 0) {
      toast.warning(`${result.sent} reminders sent, ${result.failed} failed`);
    } else {
      toast.success(`${result.sent} reminders sent successfully`);
    }
  };

  const isLoading = overdue === undefined;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Monthly Reports</h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {format(new Date(), "MMMM yyyy")} · Compliance overview
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => exportCSV(overdue ?? [])}
          disabled={!overdue?.length}>
          <Download className='h-3.5 w-3.5 mr-1.5' />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <SummaryCard
          icon={<AlertTriangle className='h-4 w-4 text-amber-500' />}
          label='Overdue Pensioners'
          value={isLoading ? "—" : (overdue?.length ?? 0).toLocaleString()}
          sub='Not verified in 37+ days'
          color='amber'
        />
        <SummaryCard
          icon={<ShieldX className='h-4 w-4 text-red-500' />}
          label='Failed This Month'
          value={
            isLoading ? "—" : (stats?.failedThisMonth ?? 0).toLocaleString()
          }
          sub='Requires investigation'
          color='red'
        />
        <SummaryCard
          icon={<Clock className='h-4 w-4 text-blue-500' />}
          label='Verified This Month'
          value={
            isLoading ? "—" : (stats?.verifiedThisMonth ?? 0).toLocaleString()
          }
          sub={`${stats?.complianceRate ?? 0}% compliance rate`}
          color='green'
        />
        <SummaryCard
          icon={<Mail className='h-4 w-4 text-purple-500' />}
          label='Pending L0 Upgrade'
          value={isLoading ? "—" : (stats?.biometric.l0 ?? 0).toLocaleString()}
          sub='No biometrics enrolled'
          color='purple'
        />
      </div>

      {/* Overdue pensioners table */}
      <Card>
        <CardHeader className='pb-3 pt-4 px-4 flex flex-row items-center justify-between'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4 text-amber-500' />
            <div className='flex items-center gap-2'>
              <p>Not verified in</p>

              <input
                type='number'
                min={1}
                max={365}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className='w-14 text-sm border rounded px-1 py-0.5'
              />

              <p>+ days</p>
            </div>
          </CardTitle>
          {!isLoading && (overdue?.length ?? 0) > 0 && (
            <Button
              onClick={handleReminders}
              size='sm'
              variant='outline'
              className='h-7 text-xs'>
              <Mail className='h-3 w-3 mr-1.5' />
              Send Reminders
            </Button>
          )}
        </CardHeader>
        <CardContent className='px-4 pb-3'>
          {isLoading ? (
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 rounded-lg' />
              ))}
            </div>
          ) : !overdue || overdue.length === 0 ? (
            <div className='text-center py-10 text-sm text-muted-foreground'>
              🎉 No overdue pensioners — excellent compliance!
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left text-xs font-semibold text-muted-foreground pb-2 pr-4'>
                      Pensioner
                    </th>
                    <th className='text-left text-xs font-semibold text-muted-foreground pb-2 pr-4 hidden md:table-cell'>
                      MDA
                    </th>
                    <th className='text-left text-xs font-semibold text-muted-foreground pb-2 pr-4'>
                      Status
                    </th>
                    <th className='text-left text-xs font-semibold text-muted-foreground pb-2 pr-4 hidden lg:table-cell'>
                      Bio Level
                    </th>
                    <th className='text-left text-xs font-semibold text-muted-foreground pb-2'>
                      Last Verified
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/60'>
                  {overdue.map((p) => (
                    <tr key={p._id} className='table-row-hover'>
                      <td className='py-3 pr-4'>
                        <div className='flex items-center gap-2.5'>
                          <div className='w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0'>
                            {p.fullName
                              .split(" ")
                              .slice(0, 2)
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className='font-medium text-xs'>{p.fullName}</p>
                            <p className='text-[10px] font-mono text-muted-foreground'>
                              {p.pensionId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 pr-4 hidden md:table-cell'>
                        <p className='text-xs truncate max-w-40'>
                          {p.lastMda ?? "—"}
                        </p>
                      </td>
                      <td className='py-3 pr-4'>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full border",
                            statusBadge(p.status),
                          )}>
                          {p.status}
                        </span>
                      </td>
                      <td className='py-3 pr-4 hidden lg:table-cell'>
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-md border",
                            biometricLevelBadge(p.biometricLevel),
                          )}>
                          {p.biometricLevel}
                        </span>
                      </td>
                      <td className='py-3'>
                        <p className='text-xs text-amber-600 font-medium flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {p.lastVerification
                            ? formatDistanceToNow(
                                new Date(p.lastVerification.verificationDate),
                                { addSuffix: true },
                              )
                            : "Never verified"}
                        </p>
                      </td>
                      <td className='py-3 pl-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 text-xs'
                          asChild>
                          <Link
                            href={`/dashboard/admin/pensioners/${p._id}/verify`}>
                            Verify <ChevronRight className='ml-1 h-3 w-3' />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
