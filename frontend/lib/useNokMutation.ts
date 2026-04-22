import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "./errors";

export function useNokMutations() {
  const addNok = useMutation(api.nextOfKin.addNextOfKin);
  const updateNok = useMutation(api.nextOfKin.updateNextOfKin);
  const removeNok = useMutation(api.nextOfKin.removeNextOfKin);

  async function add(params: Parameters<typeof addNok>[0]) {
    try {
      await addNok(params);
      toast.success("Next of kin added");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add"));
      return false;
    }
  }

  async function update(params: Parameters<typeof updateNok>[0]) {
    try {
      await updateNok(params);
      toast.success("Saved");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update"));
      return false;
    }
  }

  async function remove(id: string) {
    try {
      await removeNok({ id: id as Id<"nextOfKin"> });
      toast.success("Removed");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove"));
      return false;
    }
  }

  return { add, update, remove };
}
