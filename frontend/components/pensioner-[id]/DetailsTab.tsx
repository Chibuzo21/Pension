"use client";

import { format } from "date-fns";
import { usePensioner } from "./context/PensionerContext";
import { InfoField, InfoGrid, InfoSection } from "./Primitives";
import { usePensionerProfile } from "@/lib/usePensionerProfile";
import { Doc } from "@/convex/_generated/dataModel";

export function DetailsTab() {
  const { id } = usePensioner();
  const { pensioner } = usePensionerProfile(id);
  const pensionerActive = pensioner as Doc<"pensioners">;
  const gratuityBalance = ((pensionerActive.gratuityAmount as number) -
    pensionerActive.gratuityPaid) as number;
  return (
    <div className='flex flex-col gap-3.5'>
      {/* Personal Information */}
      <InfoSection title='👤 Personal Information'>
        <InfoGrid>
          <InfoField label='Full Name' value={pensionerActive.fullName} />
          <InfoField
            label='Date of Birth'
            value={
              pensionerActive.dob
                ? format(new Date(pensionerActive.dob), "dd MMM yyyy")
                : undefined
            }
          />
          <InfoField label='Phone' value={pensionerActive.phone} />
          <InfoField label='Email' value={pensionerActive?.email} />
          <InfoField label='NIN' value={pensionerActive.nin} mono />
          <InfoField label='BVN' value={pensionerActive.bvn} mono />
          <div className='col-span-2'>
            <InfoField label='Address' value={pensionerActive.address} />
          </div>
        </InfoGrid>
      </InfoSection>

      {/* Service Record */}
      <InfoSection title='🏢 Service Record'>
        <InfoGrid>
          <InfoField label='Last MDA' value={pensionerActive.lastMda} />
          <InfoField label='Sub-Treasury' value={pensionerActive.subTreasury} />
          <InfoField
            label='Date of Employment'
            value={
              pensionerActive.dateOfEmployment
                ? format(
                    new Date(pensionerActive.dateOfEmployment),
                    "dd MMM yyyy",
                  )
                : undefined
            }
          />
          <InfoField
            label='Date of Retirement'
            value={
              pensionerActive.dateOfRetirement
                ? format(
                    new Date(pensionerActive.dateOfRetirement),
                    "dd MMM yyyy",
                  )
                : undefined
            }
          />
          <InfoField
            label='Verification Code'
            value={pensionerActive.verificationCode}
            mono
          />
        </InfoGrid>
      </InfoSection>

      {/* Financial Details */}
      <InfoSection title='💳 Financial Details'>
        <InfoGrid>
          <InfoField label='Bank Name' value={pensionerActive.bankName} />
          <InfoField
            label='Account Number'
            value={pensionerActive.accountNumber}
            mono
          />
          <InfoField
            label='Gratuity Amount'
            value={
              pensionerActive.gratuityAmount
                ? `₦${pensionerActive.gratuityAmount.toLocaleString()}`
                : undefined
            }
          />
          <InfoField
            label='Gratuity Paid'
            value={
              pensionerActive.gratuityPaid
                ? `₦${pensionerActive.gratuityPaid.toLocaleString()}`
                : undefined
            }
          />
          <InfoField
            label='Balance'
            value={`₦${gratuityBalance.toLocaleString()}`}
            highlight={gratuityBalance > 0}
          />
        </InfoGrid>
      </InfoSection>
    </div>
  );
}
