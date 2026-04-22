import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { ClaimReviewForm } from "./ClaimReviewForm";

export interface DeathClaim {
  _id: string;
  pensionerId: string;
  pensionerName?: string;
  nokName?: string;
  _creationTime: number;
  status: "pending" | "approved" | "rejected";
  deathCertificateStorageId?: string;
  notes?: string;
}

interface ClaimCardProps {
  claim: DeathClaim;
  isReviewing: boolean;
  submitting: boolean;
  onStartReview: (claimId: string) => void;
  onApprove: (claimId: string, notes: string) => void;
  onReject: (claimId: string, notes: string) => void;
  onCancelReview: () => void;
}

export function ClaimCard({
  claim,
  isReviewing,
  submitting,
  onStartReview,
  onApprove,
  onReject,
  onCancelReview,
}: ClaimCardProps) {
  return (
    <div className='card'>
      <div className='ch'>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {claim.pensionerName ?? "Unknown pensioner"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Claimed by: {claim.nokName ?? "Unknown"} ·{" "}
            {new Date(claim._creationTime).toLocaleDateString("en-GB")}
          </div>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <div
        className='cb'
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
        <Link
          href={`/dashboard/admin/pensioners/${claim.pensionerId}`}
          style={{ fontSize: 11, color: "var(--g1)", fontWeight: 600 }}>
          View Pensioner Profile →
        </Link>

        {claim.deathCertificateStorageId && (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Death certificate uploaded ✓
          </span>
        )}

        {claim.notes && (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Notes: {claim.notes}
          </span>
        )}

        {claim.status === "pending" && !isReviewing && (
          <div style={{ marginLeft: "auto" }}>
            <button
              className='btn-sm boutline'
              style={{ fontSize: 10 }}
              onClick={() => onStartReview(claim._id)}>
              Review
            </button>
          </div>
        )}
      </div>

      {isReviewing && (
        <ClaimReviewForm
          claimId={claim._id}
          submitting={submitting}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancelReview}
        />
      )}
    </div>
  );
}
