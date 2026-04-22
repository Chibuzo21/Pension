"use client";

import Link from "next/link";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

import { PensionerProvider, usePensioner } from "./context/PensionerContext";
import { PensionerHeader } from "./PensionerHeader";
import { PensionerTabs } from "./PensionerTab";
import { DetailsTab } from "./DetailsTab";
import { NokTab } from "./NokTab";
import { DocumentsTab } from "@/components/pensioner/DocumentsTab";
import { VerificationHistoryTab } from "@/components/pensioner/VerificationHistoryTab";
import { BiometricsCard } from "@/components/pensioner-[id]/IdentityCards";
import { StatusBanners } from "@/components/pensioner-[id]/StatusBanners";
import { PensionerStatus, StatusAction } from "@/types/pensioner";
import { useState } from "react";
import { StatusChangeDialog } from "@/components/pensioner-[id]/StatusChangeDialog";
import { useStatusChangeAction } from "@/lib/useStatusActions";
import { useConvexUser } from "@/lib/useConvexUser";
import { DeathClaimTrigger } from "@/components/pensioner-[id]/DeathClaimDialog";
import { usePensionerProfile } from "@/lib/usePensionerProfile";

/* ── Inner (has access to context) ──────────────────── */
function PensionerDetailInner() {
  const { tab, id } = usePensioner();
  const { nokList, verifications, pensioner } = usePensionerProfile(id);
  const level = pensioner?.biometricLevel ?? "L0";
  const status = (pensioner?.status ?? "active") as PensionerStatus;
  const isDeceased = status === "deceased";

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const { convexUserId } = useConvexUser();
  const { saving: statusSaving, handleConfirm } = useStatusChangeAction(
    id,
    convexUserId,
  );

  function openStatus(action: StatusAction) {
    setStatusAction(action);
    setStatusNotes("");
    setDateOfDeath("");
    setStatusOpen(true);
  }

  function closeStatus() {
    setStatusOpen(false);
  }

  /* Loading */
  if (pensioner === undefined) {
    return (
      <div className='flex h-[calc(100vh-50px)] items-center justify-center'>
        <div className='text-center text-muted-foreground'>
          <div className='mb-2 text-[32px]'>⏳</div>
          Loading…
        </div>
      </div>
    );
  }

  /* Not found */
  if (!pensioner) {
    return (
      <div className='flex h-[calc(100vh-50px)] items-center justify-center'>
        <div className='text-center'>
          <div className='mb-2 text-[32px]'>❓</div>
          <p className='mb-4 text-muted-foreground'>Pensioner not found</p>
          <Link href='/dashboard/admin/pensioners'>
            <Button variant='outline'>← Back to Registry</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[calc(100vh-50px)] overflow-y-auto'>
      <PensionerHeader />
      <StatusBanners
        status={status}
        pensioner={pensioner}
        onOpenStatus={openStatus}
      />

      <div className='grid lg:grid-cols-[1fr_300px] items-start gap-3.5 px-5 py-3.5'>
        {/* Main content */}
        <div>
          <PensionerTabs />

          {tab === "details" && <DetailsTab />}
          {tab === "verifications" && (
            <VerificationHistoryTab verifications={verifications ?? []} />
          )}
          {tab === "documents" && <DocumentsTab pensionerId={pensioner._id} />}
          {tab === "nok" && <NokTab />}
        </div>

        {/* Right sidebar */}
        <BiometricsCard pensioner={pensioner} level={level} />
        <DeathClaimTrigger
          nokList={nokList}
          isDeceased={isDeceased}
          isSuspended={status === "suspended"}
          pensionerId={id}
          convexUserId={convexUserId}
          onOpenAddNok={() => {}}
        />
      </div>
      <StatusChangeDialog
        open={statusOpen}
        action={statusAction}
        notes={statusNotes}
        dateOfDeath={dateOfDeath}
        saving={statusSaving}
        onNotesChange={setStatusNotes}
        onDateChange={setDateOfDeath}
        onConfirm={() =>
          handleConfirm(statusAction!, statusNotes, dateOfDeath, closeStatus)
        }
        onClose={closeStatus}
      />
    </div>
  );
}

/* ── Root export ─────────────────────────────────────── */
export default function PensionerDetail({ id }: { id: Id<"pensioners"> }) {
  return (
    <PensionerProvider id={id}>
      <PensionerDetailInner />
    </PensionerProvider>
  );
}
