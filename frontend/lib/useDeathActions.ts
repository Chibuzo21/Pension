import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { DormantActionType } from "../components/Deaths/DormantActionModel";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "./errors";

export function useDeathActions(convexUserId: Id<"users"> | null) {
  const [submitting, setSubmitting] = useState(false);

  const reviewClaim = useMutation(api.nextOfKin.reviewDeathClaim);
  const markDeceased = useMutation(api.nextOfKin.markDeceased);
  const markIncapacitated = useMutation(api.nextOfKin.markIncapacitated);
  const reinstate = useMutation(api.nextOfKin.reinstateToActive);

  async function handleApproveClaim(claimId: string, notes: string) {
    if (!convexUserId) return;
    setSubmitting(true);
    try {
      await reviewClaim({
        claimId: claimId as Id<"deathClaims">,
        decision: "approved",
        reviewedByUserId: convexUserId,
        notes: notes || undefined,
      });
      toast.success("Claim approved — pensioner marked deceased");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve claim"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRejectClaim(claimId: string, notes: string) {
    if (!convexUserId) return;
    setSubmitting(true);
    try {
      await reviewClaim({
        claimId: claimId as Id<"deathClaims">,
        decision: "rejected",
        reviewedByUserId: convexUserId,
        notes: notes || undefined,
      });
      toast.success("Claim rejected — pensioner reinstated to active");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject claim"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDormantAction(
    pensionerId: string,
    action: DormantActionType,
    data: { notes: string; dateOfDeath?: string },
  ) {
    if (!convexUserId) return;
    setSubmitting(true);
    try {
      if (action === "deceased") {
        await markDeceased({
          pensionerId: pensionerId as Id<"pensioners">,
          dateOfDeath: data.dateOfDeath || undefined,
          confirmedByUserId: convexUserId,
          notes: data.notes || undefined,
        });
        toast.success("Pensioner marked as deceased");
      } else if (action === "incapacitated") {
        await markIncapacitated({
          pensionerId: pensionerId as Id<"pensioners">,
          reason: data.notes,
          updatedByUserId: convexUserId,
        });
        toast.success("Pensioner marked as incapacitated");
      } else {
        await reinstate({
          pensionerId: pensionerId as Id<"pensioners">,
          reinstatedByUserId: convexUserId,
          notes: data.notes || undefined,
        });
        toast.success("Pensioner reinstated to active");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update pensioner"));
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    handleApproveClaim,
    handleRejectClaim,
    handleDormantAction,
  };
}
