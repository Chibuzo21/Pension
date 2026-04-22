import { Id } from "@/convex/_generated/dataModel";

export type NokFormValues = {
  fullName: string;
  relationship: string;
  phone: string;
  bvn: string;
  nin: string;
  address: string;
};

export type NokDocument = {
  _id: Id<"nextOfKin">;
  pensionerId: Id<"pensioners">;
  fullName: string;
  relationship: string;
  phone: string;
  bvn?: string;
  nin?: string;
  address?: string;
  addedByUserId: Id<"users">;
  addedAt: number;
  isVerified?: boolean;
  verifiedByUserId?: Id<"users">;
  verifiedAt?: number;
};

export const RELATIONSHIPS = [
  "Son",
  "Daughter",
  "Spouse",
  "Sibling",
  "Nephew",
  "Niece",
  "Grandchild",
  "Other",
] as const;

export const DEFAULT_FORM_VALUES: NokFormValues = {
  fullName: "",
  relationship: "Son",
  phone: "",
  bvn: "",
  nin: "",
  address: "",
};
