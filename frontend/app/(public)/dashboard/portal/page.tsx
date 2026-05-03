"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, FileText, UserCog } from "lucide-react";
import { WelcomeHeader } from "@/components/portal/WelcomeHeader";
import { VerificationBanner } from "@/components/portal/VerificationBanner";
import { NotLinkedNotice } from "@/components/portal/NotLinkedNotice";
import ActionCard from "@/components/portal/ActionCard";
import { PersonalSummaryCard } from "@/components/portal/PersonalSummaryCard";
import { ServiceRecordCard } from "@/components/portal/ServiceRecordCard";
import { GratuityCard } from "@/components/portal/GratuityCard";
import { RecentVerificationsList } from "@/components/portal/RecentVerificationList";
import { BiometricStatusCard } from "@/components/portal/BiometricStatusCard";
import { useConvexUser } from "@/lib/useConvexUser";
import { DeathReportCard } from "@/components/portal/DeathReportCard";

const OVERDUE_MS = 37 * 24 * 60 * 60 * 1000;

function DashboardSkeleton() {
  return (
    <div className='max-w-2xl mx-auto px-4 py-5 space-y-4'>
      <Skeleton className='h-16 rounded-xl bg-smoke' />
      <Skeleton className='h-20 rounded-xl bg-smoke' />
      <div className='grid grid-cols-3 gap-3'>
        <Skeleton className='h-28 rounded-xl bg-smoke' />
        <Skeleton className='h-28 rounded-xl bg-smoke' />
        <Skeleton className='h-28 rounded-xl bg-smoke' />
      </div>
      <Skeleton className='h-48 rounded-xl bg-smoke' />
      <Skeleton className='h-36 rounded-xl bg-smoke' />
      <Skeleton className='h-32 rounded-xl bg-smoke' />
    </div>
  );
}

export default function PensionerPortalPage() {
  const { convexUser, pensionerId, isLoaded } = useConvexUser();
  const {
    pensioner,
    isLoaded: pensionerLoaded,
    isLinked,
  } = useCurrentPensioner();

  const verifications = useQuery(
    api.verification.getForPensioner,
    pensioner?._id ? { pensionerId: pensioner._id } : "skip",
  );

  const lastVerification = verifications?.[0] ?? null;
  const isOverdue =
    !lastVerification ||
    new Date(lastVerification.verificationDate) <
      new Date(Date.now() - OVERDUE_MS);

  if (!isLoaded || !pensionerLoaded) return <DashboardSkeleton />;

  return (
    <div className='max-w-2xl mx-auto px-4 py-5 space-y-4 min-w-0'>
      <WelcomeHeader />

      {isLinked && (
        <VerificationBanner
          lastVerification={lastVerification}
          isOverdue={isOverdue as boolean}
        />
      )}

      {!isLinked && <NotLinkedNotice />}

      {/* Quick actions — 3 columns */}
      <div className='grid grid-cols-3 gap-3'>
        <ActionCard
          href='/dashboard/portal/verify'
          icon={<ShieldCheck className='h-5 w-5' />}
          label='Verify Liveness'
          sub='Biometric check'
          color='primary'
        />
        <ActionCard
          href='/dashboard/portal/documents'
          icon={<FileText className='h-5 w-5' />}
          label='My Documents'
          sub='View uploads'
          color='blue'
        />
        <ActionCard
          href='/dashboard/portal/edit'
          icon={<UserCog className='h-5 w-5' />}
          label='Edit Profile'
          sub='Update details'
          color='slate'
        />
      </div>

      {/* Biometric status strip */}
      {pensioner && <BiometricStatusCard pensioner={pensioner} />}

      {/* Personal details */}
      {pensioner && <PersonalSummaryCard pensioner={pensioner} />}

      {/* Service record */}
      {pensioner && <ServiceRecordCard pensioner={pensioner} />}

      {/* Gratuity */}
      {pensioner && <GratuityCard pensioner={pensioner} />}
      {/* Death reporting */}
      {pensioner && <DeathReportCard />}
      {/* Verifications */}
      {verifications && verifications.length > 0 && (
        <RecentVerificationsList verifications={verifications} />
      )}
    </div>
  );
}
