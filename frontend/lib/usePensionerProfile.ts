import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type PensionerProfile = Doc<"pensioners"> & {
  nextOfKin: Doc<"nextOfKin">[];
  documents: Doc<"documents">[];
  verifications: Doc<"verifications">[];
};

export function usePensionerProfile(id: string) {
  const data = useQuery(api.pensioners.getById, {
    id: id as Id<"pensioners">,
  }) as PensionerProfile | null | undefined;

  if (!data) {
    return {
      pensioner: data, // undefined or null — component checks this
      nokList: [],
      verifications: [],
      documents: [],
      isLoading: data === undefined,
      notFound: data === null,
    };
  }

  const { nextOfKin, documents, verifications, ...pensioner } = data;

  return {
    pensioner, // typed as Doc<"pensioners"> — all fields present
    nokList: nextOfKin,
    verifications,
    documents,
    isLoading: false,
    notFound: false,
  };
}
