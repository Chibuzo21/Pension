"use client";

import Link from "next/link";
import { usePensioner } from "./context/PensionerContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePensionerProfile } from "@/lib/usePensionerProfile";

const STATUSES = ["active", "deceased", "suspended", "flagged"] as const;

const STATUS_VARIANTS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  deceased: "bg-slate-100 text-slate-600",
  suspended: "bg-yellow-100 text-yellow-800",
  flagged: "bg-red-100 text-red-800",
};

const LEVEL_VARIANTS: Record<string, string> = {
  L1: "bg-indigo-100 text-indigo-700",
  L2: "bg-violet-100 text-violet-700",
  L3: "bg-green-100 text-green-700",
};

export function PensionerHeader() {
  const { id, isOfficer, handleStatus } = usePensioner();
  const { pensioner } = usePensionerProfile(id);

  const initials = pensioner?.fullName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("");
  const status = pensioner?.status as string;
  const biometricLevel = pensioner?.biometricLevel as string;

  return (
    <div className='flex flex-wrap items-center gap-2 sm:gap-2.5 border-b border-border bg-white px-3 sm:px-5 py-2 sm:py-2.5'>
      {/* Back button */}
      <Link href='/dashboard/admin/pensioners'>
        <Button
          variant='outline'
          size='sm'
          className='h-7 text-[9.5px] shrink-0'>
          ← Registry
        </Button>
      </Link>

      {/* Avatar + name — takes all remaining space */}
      <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5'>
        <div className='flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-primary text-[11px] sm:text-[12px] font-extrabold text-white'>
          {initials}
        </div>

        <div className='min-w-0'>
          <p className='truncate text-[13px] sm:text-[14px] font-bold'>
            {pensioner?.fullName}
          </p>
          <div className='flex flex-wrap items-center gap-1 sm:gap-1.5'>
            <code className='text-[9px] text-primary'>
              {pensioner?.pensionId}
            </code>

            {isOfficer ? (
              <Select value={pensioner?.status} onValueChange={handleStatus}>
                <SelectTrigger
                  className={cn(
                    "h-5 rounded-lg border-none px-2 text-[9px] font-bold shadow-none focus:ring-0",
                    STATUS_VARIANTS[status],
                  )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-g1 text-white border-border p-2 rounded-lg shadow-lg'>
                  {STATUSES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className='hover:bg-white/10 text-sm'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge
                className={cn(
                  "rounded-lg px-2 py-0 text-[9px] font-bold",
                  STATUS_VARIANTS[status],
                )}>
                {pensioner?.status}
              </Badge>
            )}

            <Badge
              className={cn(
                "rounded-lg px-2 py-0 text-[9px] font-bold",
                LEVEL_VARIANTS[biometricLevel] ?? "bg-gray-100 text-gray-600",
              )}>
              {pensioner?.biometricLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Officer actions — collapse to icon-only on xs */}
      {isOfficer && (
        <div className='flex shrink-0 gap-1.5'>
          <Link href={`/dashboard/admin/pensioners/${id}/edit`}>
            <Button variant='outline' size='sm' className='h-7 text-[9.5px]'>
              <span className='sm:hidden'>✏️</span>
              <span className='hidden sm:inline'>✏️ Edit</span>
            </Button>
          </Link>
          <Link href={`/dashboard/admin/pensioners/${id}/enroll`}>
            <Button
              size='sm'
              className='h-7 bg-primary text-[9.5px] text-white hover:bg-green-700'>
              <span className='sm:hidden'>🔐</span>
              <span className='hidden sm:inline'>🔐 Enroll Now</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
