import { Id } from "@/convex/_generated/dataModel";

export type PensionerFormValues = {
  pensionId: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  bvn: string;
  nin: string;
  dateOfEmployment: string;
  dateOfRetirement: string;
  lastMda: string;
  lastRank: string;
  subTreasury: string;
  bankName: string;
  accountNumber: string;
  gratuityAmount: number;
  gratuityPaid: number;
  nok: NokEntry[];
};

export type NokEntry = {
  _id?: Id<"nextOfKin">; // present when editing existing NOK, absent when new
  fullName: string;
  relationship: string;
  phone: string;
  nin: string;
  address: string;
};

export const DEFAULT_PENSIONER_VALUES: PensionerFormValues = {
  fullName: "",
  dob: "",
  email: "",
  phone: "",
  address: "",
  bvn: "",
  nin: "",
  pensionId: "",
  dateOfEmployment: "",
  dateOfRetirement: "",
  lastMda: "",
  lastRank: "",
  subTreasury: "",
  bankName: "",
  accountNumber: "",
  gratuityAmount: 0,
  gratuityPaid: 0,
  // Add this to PensionerFormValues
  nok: [],
};

export const BANKS = [
  "Access Bank",
  "Access-Diamond",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Fidelity Bank",
  "Union Bank",
  "Sterling Bank",
  "Polaris Bank",
  "Wema Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Unity Bank",
] as const;

export const SUB_TREASURIES = [
  "Abia North",
  "Abia Central",
  "Abia South",
  "Umuahia",
  "Aba",
  "Arochukwu",
] as const;
