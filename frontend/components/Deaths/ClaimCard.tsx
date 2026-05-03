// components/Deaths/ClaimCard.tsx
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  ExternalLink,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ClaimReviewForm } from "./ClaimReviewForm";

export interface DeathClaim {
  _id: string;
  pensionerId: string;
  pensionerName?: string;
  pensionerDateOfDeath?: string;
  nokName?: string;
  nokRelationship?: string;
  nokPhone?: string;
  _creationTime: number;
  status: "pending" | "approved" | "rejected";
  // Raw storage ID
  deathCertificateStorageId?: string;
  // Resolved fields from the updated query
  deathCertificateUrl?: string | null;
  hasCertificate?: boolean;
  certificatePending?: boolean;
  notes?: string;
  reviewedAt?: number;
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const submittedDate = new Date(claim._creationTime).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <div className='card' style={{ marginBottom: 10 }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className='ch' style={{ alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
            {claim.pensionerName ?? "Unknown pensioner"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 10px",
            }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <User style={{ width: 10, height: 10 }} />
              {claim.nokName ?? "Unknown NOK"}
              {claim.nokRelationship && ` · ${claim.nokRelationship}`}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Clock style={{ width: 10, height: 10 }} />
              Submitted {submittedDate}
            </span>
            {claim.pensionerDateOfDeath && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Calendar style={{ width: 10, height: 10 }} />
                Died {claim.pensionerDateOfDeath}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div
        className='cb'
        style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Certificate section */}
        <CertificateSection claim={claim} />

        {/* NOK contact */}
        {claim.nokPhone && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--muted)",
            }}>
            <Phone style={{ width: 11, height: 11 }} />
            <span>NOK phone: </span>
            <a
              href={`tel:${claim.nokPhone}`}
              style={{ color: "var(--g1)", fontWeight: 600 }}>
              {claim.nokPhone}
            </a>
          </div>
        )}

        {/* Notes submitted with the claim */}
        {claim.notes && (
          <div
            style={{
              background: "var(--smoke)",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 11,
              color: "var(--muted)",
              borderLeft: "3px solid var(--border)",
            }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>
              Notes:{" "}
            </span>
            {claim.notes}
          </div>
        )}

        {/* Footer row: link + toggle + review button */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 2,
          }}>
          <Link
            href={`/dashboard/admin/pensioners/${claim.pensionerId}`}
            style={{ fontSize: 11, color: "var(--g1)", fontWeight: 600 }}>
            View Pensioner Profile →
          </Link>

          <button
            style={{
              fontSize: 10,
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: 0,
            }}
            onClick={() => setDetailsOpen((v) => !v)}>
            {detailsOpen ? (
              <>
                <ChevronUp style={{ width: 11, height: 11 }} /> Less
              </>
            ) : (
              <>
                <ChevronDown style={{ width: 11, height: 11 }} /> More details
              </>
            )}
          </button>

          {claim.status === "pending" && !isReviewing && (
            <div style={{ marginLeft: "auto" }}>
              <button
                className='btn-sm boutline'
                style={{ fontSize: 10 }}
                onClick={() => onStartReview(claim._id)}>
                Review Claim
              </button>
            </div>
          )}

          {claim.status !== "pending" && claim.reviewedAt && (
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginLeft: "auto",
              }}>
              Reviewed{" "}
              {new Date(claim.reviewedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Expandable extra details */}
        {detailsOpen && (
          <div
            style={{
              background: "var(--smoke)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              color: "var(--muted)",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}>
            <div>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                Claim ID:{" "}
              </span>
              <span style={{ fontFamily: "monospace" }}>{claim._id}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                Pensioner ID:{" "}
              </span>
              <span style={{ fontFamily: "monospace" }}>
                {claim.pensionerId}
              </span>
            </div>
            {claim.nokRelationship && (
              <div>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>
                  NOK relationship:{" "}
                </span>
                {claim.nokRelationship}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Review form ────────────────────────────────────────── */}
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

// ── Certificate section ───────────────────────────────────────────────────────
function CertificateSection({ claim }: { claim: DeathClaim }) {
  // No certificate at all
  if (
    !claim.deathCertificateStorageId ||
    claim.deathCertificateStorageId === "no_cert"
  ) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "var(--muted)",
          padding: "6px 8px",
          background: "var(--smoke)",
          borderRadius: 6,
        }}>
        <AlertCircle
          style={{ width: 12, height: 12, color: "var(--amber, #f59e0b)" }}
        />
        No death certificate uploaded — officer should request one
      </div>
    );
  }

  // Uploaded but URL not yet resolved (placeholder)
  if (claim.certificatePending) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "var(--muted)",
          padding: "6px 8px",
          background: "var(--smoke)",
          borderRadius: 6,
        }}>
        <FileText style={{ width: 12, height: 12 }} />
        Certificate upload pending processing
      </div>
    );
  }

  // Has a real resolved URL — show view button
  if (claim.deathCertificateUrl) {
    return (
      <a
        href={claim.deathCertificateUrl}
        target='_blank'
        rel='noopener noreferrer'
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          color: "var(--g1)",
          padding: "6px 10px",
          background: "color-mix(in srgb, var(--g1) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--g1) 20%, transparent)",
          borderRadius: 6,
          textDecoration: "none",
          width: "fit-content",
        }}>
        <FileText style={{ width: 13, height: 13 }} />
        View Death Certificate
        <ExternalLink style={{ width: 11, height: 11, opacity: 0.6 }} />
      </a>
    );
  }

  // Storage ID exists but getUrl returned null (deleted or invalid)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "var(--muted)",
        padding: "6px 8px",
        background: "var(--smoke)",
        borderRadius: 6,
      }}>
      <AlertCircle
        style={{ width: 12, height: 12, color: "var(--red, #ef4444)" }}
      />
      Certificate file unavailable — may have been deleted
    </div>
  );
}
