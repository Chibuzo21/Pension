"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";
import { PensionerSearch } from "@/components/adminVerify/pensionSearch";
import { ArrowLeft } from "lucide-react";
import { AdminVerifyFlow } from "@/components/adminVerify/adminVerifyFlow";

// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAssistedVerifyPage() {
  const [selected, setSelected] = useState<Doc<"pensioners"> | null>(null);

  return (
    <div className='max-w-2xl mx-auto space-y-5 p-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
          <Link href='/dashboard/admin'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h2 className='text-lg font-semibold'>Assisted Verification</h2>
          <p className='text-sm text-muted-foreground'>
            Verify a pensioner on their behalf using this device
          </p>
        </div>
      </div>

      {!selected && <PensionerSearch onSelect={setSelected} />}

      {selected && (
        <>
          <AdminVerifyFlow pensioner={selected} />

          <Button
            variant='ghost'
            size='sm'
            className='w-full text-muted-foreground'
            onClick={() => setSelected(null)}>
            ← Search for a different pensioner
          </Button>
        </>
      )}
    </div>
  );
}
