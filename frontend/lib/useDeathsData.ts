import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDeathsData() {
  const pendingClaims = useQuery(api.nextOfKin.getAllDeathClaims, {
    status: "pending",
  });
  const allClaims = useQuery(api.nextOfKin.getAllDeathClaims, {});
  const dormantList = useQuery(api.nextOfKin.getDormantPensioners, {});
  const deceasedList = useQuery(api.nextOfKin.getDeceasedPensioners, {});

  const isLoading =
    pendingClaims === undefined ||
    allClaims === undefined ||
    dormantList === undefined ||
    deceasedList === undefined;

  return {
    pendingClaims: pendingClaims ?? [],
    allClaims: allClaims ?? [],
    dormantList: dormantList ?? [],
    deceasedList: deceasedList ?? [],
    pendingCount: pendingClaims?.length ?? 0,
    dormantCount: dormantList?.length ?? 0,
    isLoading,
  };
}
