// components/portal/DeathReportCard.tsx
// Shown on the pensioner dashboard — lets family members know where to report a death
// The card is deliberately informational, not action-triggering (since the pensioner
// themselves is logged in; the actual form is public at /report-death)

import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function DeathReportCard() {
  return (
    <div className='rounded-xl border border-[#001407]/8 bg-white overflow-hidden'>
      {/* Red top stripe */}
      <div className='h-1 bg-linear-to-r from-red-500 to-red-300' />

      <div className='px-4 py-4 space-y-3'>
        <div className='flex items-start gap-2.5'>
          <div className='w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5'>
            <AlertTriangle className='w-3.5 h-3.5 text-red-500' />
          </div>
          <div>
            <p className='text-[12px] font-semibold text-[#0c190c]'>
              For family members & next of kin
            </p>
            <p className='text-[11px] text-[#001407]/50 mt-0.5 leading-relaxed'>
              If the pensioner linked to this account has passed away, a
              registered next of kin can submit a death report online. No
              account is required.
            </p>
          </div>
        </div>

        <Link
          href='/report-death'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group'>
          <span className='text-[12px] font-semibold text-red-700'>
            Submit a death report
          </span>
          <ExternalLink className='w-3.5 h-3.5 text-red-400 group-hover:text-red-600 transition-colors' />
        </Link>

        <p className='text-[10px] text-[#001407]/30 leading-relaxed'>
          The pension officer will review and verify the claim before any
          changes are made. Payments will be paused during review.
        </p>
      </div>
    </div>
  );
}
