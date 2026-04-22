"use client";

import { createContext, useContext, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useConvexUser } from "@/lib/useConvexUser";
import { usePensionerProfile } from "@/lib/usePensionerProfile";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export type Tab = "details" | "verifications" | "documents" | "nok";

interface PensionerContextValue {
  //   pensioner?: Doc<"pensioners"> | null;
  id: Id<"pensioners">;
  isOfficer: boolean;
  tab: Tab;
  //   nokList: Doc<"nextOfKin">[];
  setTab: (t: Tab) => void;
  handleStatus: (status: string) => Promise<void>;
}

const PensionerContext = createContext<PensionerContextValue | null>(null);
type Status = "active" | "flagged" | "suspended" | "deceased"; // example

export function PensionerProvider({
  id,
  children,
}: {
  id: Id<"pensioners">;
  children: React.ReactNode;
}) {
  const { convexUserId, isOfficer } = useConvexUser();
  const { pensioner } = usePensionerProfile(id);
  const updateStatus = useMutation(api.pensioners.updateStatus);
  const [tab, setTab] = useState<Tab>("details");

  async function handleStatus(status: string) {
    if (!convexUserId || !pensioner) return;
    try {
      await updateStatus({
        id: pensioner._id,
        status: status as Status,
        updatedByUserId: convexUserId,
      });
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed"));
    }
  }

  return (
    <PensionerContext.Provider
      value={{ id, isOfficer, tab, setTab, handleStatus }}>
      {children}
    </PensionerContext.Provider>
  );
}

export function usePensioner() {
  const ctx = useContext(PensionerContext);
  if (!ctx)
    throw new Error("usePensioner must be used within PensionerProvider");
  return ctx;
}
