"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Verification {
  verificationDate: string | number;
  assuranceLevel?: string;
}

interface Props {
  lastVerification: Verification | null;
  isOverdue: boolean;
}

export function VerificationBanner({ lastVerification, isOverdue }: Props) {
  if (isOverdue) {
    return (
      <div className='flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200'>
        <AlertTriangle className='h-5 w-5 text-amber-500 shrink-0' />
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-amber-800'>
            Verification required
          </p>
          <p className='text-xs text-amber-600 mt-0.5'>
            {lastVerification
              ? `Last verified ${formatDistanceToNow(new Date(lastVerification.verificationDate), { addSuffix: true })}`
              : "You have never completed biometric verification"}
          </p>
        </div>
        <Button
          size='sm'
          className='bg-amber-600 hover:bg-amber-700 shrink-0'
          asChild>
          <Link href='/dashboard/portal/verify'>Verify Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200'>
      <CheckCircle2 className='h-5 w-5 text-emerald-500 shrink-0' />
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-emerald-800'>
          Verification up to date
        </p>
        <p className='text-xs text-emerald-600 mt-0.5'>
          Last verified{" "}
          {formatDistanceToNow(new Date(lastVerification!.verificationDate), {
            addSuffix: true,
          })}
          {lastVerification?.assuranceLevel &&
            ` · ${lastVerification.assuranceLevel}`}
        </p>
      </div>
      <Button
        size='sm'
        variant='outline'
        className='border-emerald-300 shrink-0'
        asChild>
        <Link href='/dashboard/portal/verify'>Verify Again</Link>
      </Button>
    </div>
  );
}
