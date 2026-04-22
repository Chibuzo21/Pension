import { useState } from "react";
import { ClaimCard, DeathClaim } from "./ClaimCard";
import { DormantCard, DormantPensioner } from "./DormantCard";
import { DeceasedCard, DeceasedPensioner } from "./DeceasedCard";
import {
  DormantActionModal,
  DormantActionState,
  DormantActionType,
} from "./DormantActionModel";
import { EmptyState } from "./EmptyState";

// ── Claims Tab ────────────────────────────────────────────────

interface ClaimsTabProps {
  claims: DeathClaim[] | undefined;
  submitting: boolean;
  onApprove: (claimId: string, notes: string) => void;
  onReject: (claimId: string, notes: string) => void;
}

export function ClaimsTab({
  claims,
  submitting,
  onApprove,
  onReject,
}: ClaimsTabProps) {
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  if (!claims || claims.length === 0) {
    return <EmptyState message='No death claims submitted yet.' />;
  }

  return (
    <>
      {claims.map((claim) => (
        <ClaimCard
          key={claim._id}
          claim={claim}
          isReviewing={reviewingId === claim._id}
          submitting={submitting}
          onStartReview={setReviewingId}
          onApprove={(id, notes) => {
            onApprove(id, notes);
            setReviewingId(null);
          }}
          onReject={(id, notes) => {
            onReject(id, notes);
            setReviewingId(null);
          }}
          onCancelReview={() => setReviewingId(null)}
        />
      ))}
    </>
  );
}

// ── Dormant Tab ───────────────────────────────────────────────

interface DormantTabProps {
  dormantList: DormantPensioner[] | undefined;
  submitting: boolean;
  onAction: (
    pensionerId: string,
    action: DormantActionType,
    data: { notes: string; dateOfDeath?: string },
  ) => void;
}

export function DormantTab({
  dormantList,
  submitting,
  onAction,
}: DormantTabProps) {
  const [dormantAction, setDormantAction] = useState<DormantActionState | null>(
    null,
  );

  const handleAction = (
    pensionerId: string,
    pensionerName: string,
    action: DormantActionType,
  ) => {
    setDormantAction({ pensionerId, pensionerName, action });
  };

  if (!dormantList || dormantList.length === 0) {
    return (
      <EmptyState message='No dormant pensioners — all active pensioners are verifying on time.' />
    );
  }

  return (
    <>
      <div
        className='card'
        style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
        <div className='cb'>
          <p style={{ fontSize: 12, color: "#92400E" }}>
            <strong>
              {dormantList.length} pensioner
              {dormantList.length !== 1 ? "s" : ""}
            </strong>{" "}
            have missed 2+ monthly verifications and require investigation. Each
            must be resolved — either reinstated, marked incapacitated, or
            confirmed deceased.
          </p>
        </div>
      </div>

      {dormantList.map((p) => (
        <DormantCard key={p._id} pensioner={p} onAction={handleAction} />
      ))}

      {dormantAction && (
        <DormantActionModal
          dormantAction={dormantAction}
          submitting={submitting}
          onConfirm={(data) => {
            onAction(dormantAction.pensionerId, dormantAction.action, data);
            setDormantAction(null);
          }}
          onCancel={() => setDormantAction(null)}
        />
      )}
    </>
  );
}

// ── Deceased Tab ──────────────────────────────────────────────

interface DeceasedTabProps {
  deceasedList: DeceasedPensioner[] | undefined;
}

export function DeceasedTab({ deceasedList }: DeceasedTabProps) {
  if (!deceasedList || deceasedList.length === 0) {
    return <EmptyState message='No deceased records.' />;
  }

  return (
    <>
      {deceasedList.map((p) => (
        <DeceasedCard key={p._id} pensioner={p} />
      ))}
    </>
  );
}
