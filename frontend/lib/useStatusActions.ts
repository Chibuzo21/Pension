import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { StatusAction } from "@/types/pensioner";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "./errors";

export function useDeathClaimAction(
  pensionerId: Id<"pensioners">,
  convexUserId: Id<"users"> | null,
) {
  const submitDeathClaim = useMutation(api.nextOfKin.submitDeathClaim);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    claimNokId: string,
    claimFile: File | null,
    onSuccess: () => void,
  ) {
    if (!convexUserId) return;
    if (!claimNokId) {
      toast.error("Select the next of kin submitting the claim");
      return;
    }
    setSaving(true);
    try {
      // TODO: upload claimFile to Convex storage and use returned storageId
      await submitDeathClaim({
        pensionerId: pensionerId as Id<"pensioners">,
        claimedByNextOfKinId: claimNokId as Id<"nextOfKin">,
        deathCertificateStorageId: claimFile ? "pending_upload" : "no_cert",
        submittedByUserId: convexUserId,
      });
      toast.success("Death claim submitted — account suspended pending review");
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err, "Submission failed"));
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleSubmit };
}

export function useStatusChangeAction(
  pensionerId: Id<"pensioners">,
  convexUserId: Id<"users"> | null,
) {
  const markDeceased = useMutation(api.nextOfKin.markDeceased);
  const markIncapacitated = useMutation(api.nextOfKin.markIncapacitated);
  const reinstate = useMutation(api.nextOfKin.reinstateToActive);
  const [saving, setSaving] = useState(false);

  async function handleConfirm(
    action: StatusAction,
    notes: string,
    dateOfDeath: string,
    onSuccess: () => void,
  ) {
    if (!convexUserId) return;
    if (action === "incapacitated" && !notes.trim()) {
      toast.error("A reason is required");
      return;
    }
    setSaving(true);
    try {
      if (action === "deceased") {
        await markDeceased({
          pensionerId: pensionerId as Id<"pensioners">,
          dateOfDeath: dateOfDeath || undefined,
          confirmedByUserId: convexUserId,
          notes: notes || undefined,
        });
        toast.success("Pensioner marked as deceased");
      } else if (action === "incapacitated") {
        await markIncapacitated({
          pensionerId: pensionerId as Id<"pensioners">,
          reason: notes,
          updatedByUserId: convexUserId,
        });
        toast.success("Pensioner marked as incapacitated");
      } else {
        await reinstate({
          pensionerId: pensionerId as Id<"pensioners">,
          reinstatedByUserId: convexUserId,
          notes: notes || undefined,
        });
        toast.success("Pensioner reinstated to active");
      }
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed"));
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleConfirm };
}
