"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePensioner } from "./context/PensionerContext";
import { InfoField, InfoGrid, InfoSection } from "./Primitives";
import { usePensionerProfile } from "@/lib/usePensionerProfile";
import { Doc } from "@/convex/_generated/dataModel";

export function NokTab() {
  const { id, isOfficer } = usePensioner();
  const { nokList } = usePensionerProfile(id);
  const nok = nokList[0];

  if (!nok) {
    return (
      <div className='flex flex-col items-center gap-3 py-7 text-center text-[12px] text-muted-foreground'>
        No next of kin on record.
        {isOfficer && (
          <Link href={`/dashboard/admin/pensioners/${id}/edit`}>
            <Button size='sm' className='bg-g1 text-white hover:bg-green-800'>
              ➕ Add via Edit
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <InfoSection title='👥 Next of Kin'>
      <InfoGrid>
        <InfoField label='Name' value={nok.fullName} />
        <InfoField label='Relationship' value={nok.relationship} />
        <InfoField label='NIN' value={nok.nin} mono />
        {/* <InfoField label='BVN' value={nok.bvn} mono /> */}
        <div className='col-span-2'>
          <InfoField label='Address' value={nok.address} />
        </div>
      </InfoGrid>
    </InfoSection>
  );
}
