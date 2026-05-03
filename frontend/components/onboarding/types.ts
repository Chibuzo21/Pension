// components/onboarding/types.ts

export interface RegistrationForm {
  fullName: string;
  dob: string;
  nin: string;
  bvn?: string;
  email?: string;
  phone?: string;
  address?: string;
  lastMda?: string;
  subTreasury?: string;
  dateOfEmployment?: string;
  dateOfRetirement?: string;
  bankName?: string;
  accountNumber?: string;
  gratuityAmount?: string;
  gratuityPaid?: string;

  // Deceased registration fields
  isDeceased?: boolean;
  dateOfDeath?: string;
  registrantName?: string;
  registrantRelationship?: string;
  registrantPhone?: string;
  deathCertificateFile?: FileList;

  nok: {
    fullName: string;
    relationship: string;
    phone: string;
    nin?: string;
    address?: string;
  }[];
}
