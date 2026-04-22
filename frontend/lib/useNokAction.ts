import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "./errors";

export interface NokFormValues {
  fullName: string;
  relationship: string;
  phone: string;
  nin: string;
  address: string;
}

export function useNokActions(convexUserId: Id<"users"> | null) {
  const addNok = useMutation(api.nextOfKin.addNextOfKin);
  const updateNok = useMutation(api.nextOfKin.updateNextOfKin);
  const removeNok = useMutation(api.nextOfKin.removeNextOfKin);

  const [saving, setSaving] = useState(false);

  async function handleSave(
    form: NokFormValues,
    editingNokId: string | null,
    pensionerId: Id<"pensioners">,
    onSuccess: () => void,
  ) {
    if (!convexUserId) return;
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("Full name and phone are required");
      return;
    }
    setSaving(true);
    try {
      if (editingNokId) {
        await updateNok({
          id: editingNokId as Id<"nextOfKin">,
          fullName: form.fullName,
          relationship: form.relationship,
          phone: form.phone,
          address: form.address,
          nin: form.nin || undefined,
        });
        toast.success("Next of kin updated");
      } else {
        await addNok({
          pensionerId: pensionerId as Id<"pensioners">,
          fullName: form.fullName.trim(),
          relationship: form.relationship,
          phone: form.phone.trim(),
          nin: form.nin.trim() || undefined,
          address: form.address.trim(),
          addedByUserId: convexUserId,
        });
        toast.success("Next of kin added");
      }
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(nokId: string, onSuccess: () => void) {
    try {
      await removeNok({ id: nokId as Id<"nextOfKin"> });
      toast.success("Removed");
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed"));
    }
  }

  async function toggleVerified(nok: Doc<"nextOfKin">) {
    try {
      await updateNok({
        id: nok._id as Id<"nextOfKin">,
        isVerified: !nok.isVerified,
      });
      toast.success(
        nok.isVerified ? "Marked unverified" : "Marked as identity verified",
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed"));
    }
  }

  return { saving, handleSave, handleRemove, toggleVerified };
}
