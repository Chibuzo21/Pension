"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "./useConvexUser";

export function useCurrentPensioner() {
  const { pensionerId, isLoaded: userLoaded } = useConvexUser();

  const pensioner = useQuery(
    api.pensioners.getById,
    userLoaded && pensionerId ? { id: pensionerId } : "skip",
  );

  return {
    pensioner: pensioner ?? null,
    isLoaded: userLoaded && (!pensionerId || pensioner !== undefined),
    isLinked: !!pensionerId,
  };
}
