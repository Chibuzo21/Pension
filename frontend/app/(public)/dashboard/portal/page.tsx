"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, FileText } from "lucide-react";

import { WelcomeHeader } from "@/components/portal/WelcomeHeader";
import { VerificationBanner } from "@/components/portal/VerificationBanner";
import { NotLinkedNotice } from "@/components/portal/NotLinkedNotice";
import ActionCard from "@/components/portal/ActionCard";
import { PersonalSummaryCard } from "@/components/portal/PersonalSummaryCard";
import { GratuityCard } from "@/components/portal/GratuityCard";
import { RecentVerificationsList } from "@/components/portal/RecentVerificationList";

const OVERDUE_MS = 37 * 24 * 60 * 60 * 1000;

export default function PensionerPortalPage() {
  const { pensioner, isLoaded, isLinked } = useCurrentPensioner();

  const verifications = useQuery(
    api.verification.getForPensioner,
    pensioner?._id ? { pensionerId: pensioner._id } : "skip",
  );

  const lastVerification = verifications?.[0] ?? null;
  const isOverdue =
    !lastVerification ||
    new Date(lastVerification.verificationDate) <
      new Date(Date.now() - OVERDUE_MS);

  if (!isLoaded) {
    return (
      <div className='max-w-2xl mx-auto space-y-4'>
        <Skeleton className='h-14 rounded-xl' />
        <Skeleton className='h-20 rounded-xl' />
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-28 rounded-xl' />
          <Skeleton className='h-28 rounded-xl' />
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <WelcomeHeader />

      {isLinked && (
        <VerificationBanner
          lastVerification={lastVerification}
          isOverdue={isOverdue}
        />
      )}

      {!isLinked && <NotLinkedNotice />}

      <div className='grid grid-cols-2 gap-3'>
        <ActionCard
          href='/dashboard/portal/verify'
          icon={<ShieldCheck className='h-6 w-6' />}
          label='Verify Liveness'
          sub='Complete biometric check'
          color='primary'
        />
        <ActionCard
          href='/dashboard/portal/documents'
          icon={<FileText className='h-6 w-6' />}
          label='My Documents'
          sub='View uploaded documents'
          color='blue'
        />
      </div>

      {pensioner && <PersonalSummaryCard pensioner={pensioner} />}
      {pensioner && <GratuityCard pensioner={pensioner} />}

      {verifications && verifications.length > 0 && (
        <RecentVerificationsList verifications={verifications} />
      )}
    </div>
  );
}
