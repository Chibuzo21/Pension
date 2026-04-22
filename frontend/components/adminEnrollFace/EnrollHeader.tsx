import { ArrowLeft, Info } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function EnrollHeader() {
  return (
    <>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
          <Link href='/dashboard/admin/pensioners'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h2 className='text-lg font-semibold'>Face Enrolment</h2>
          <p className='text-sm text-muted-foreground'>
            Capture reference face for future verifications
          </p>
        </div>
      </div>

      {/* Info banner — updated to reflect InsightFace */}
      <div className='flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5'>
        <Info className='h-4 w-4 text-blue-600 shrink-0 mt-0.5' />
        <p className='text-xs text-blue-800 leading-relaxed'>
          A photo is captured and sent to the local InsightFace server to
          extract a 512-float ArcFace descriptor. The photo is stored for human
          review — no data leaves your local network.
        </p>
      </div>
    </>
  );
}
