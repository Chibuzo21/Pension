import { useForm } from "react-hook-form";

interface ClaimReviewFormValues {
  notes: string;
}

interface ClaimReviewFormProps {
  claimId: string;
  submitting: boolean;
  onApprove: (claimId: string, notes: string) => void;
  onReject: (claimId: string, notes: string) => void;
  onCancel: () => void;
}

export function ClaimReviewForm({
  claimId,
  submitting,
  onApprove,
  onReject,
  onCancel,
}: ClaimReviewFormProps) {
  const { register, getValues } = useForm<ClaimReviewFormValues>({
    defaultValues: { notes: "" },
  });

  return (
    <div
      style={{
        margin: "0 14px 14px",
        background: "var(--smoke)",
        borderRadius: 8,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
      <p style={{ fontSize: 12, fontWeight: 600 }}>Review Death Claim</p>
      <p style={{ fontSize: 11, color: "var(--muted)" }}>
        Approving will mark the pensioner as deceased and stop pension payments.
        Rejecting will reinstate them to active status.
      </p>

      <textarea
        {...register("notes")}
        className='srch'
        style={{
          width: "100%",
          minHeight: 60,
          resize: "vertical",
          fontSize: 11,
        }}
        placeholder='Notes (optional — reason for approval or rejection)'
      />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          className='btn-sm boutline'
          style={{ fontSize: 10 }}
          onClick={onCancel}>
          Cancel
        </button>
        <button
          className='btn-sm'
          style={{
            fontSize: 10,
            background: "var(--red)",
            color: "#fff",
            border: "none",
          }}
          disabled={submitting}
          onClick={() => onReject(claimId, getValues("notes"))}>
          Reject
        </button>
        <button
          className='btn-sm bgreen'
          style={{ fontSize: 10 }}
          disabled={submitting}
          onClick={() => onApprove(claimId, getValues("notes"))}>
          {submitting ? "Processing…" : "Approve & Mark Deceased"}
        </button>
      </div>
    </div>
  );
}
