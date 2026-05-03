import { CheckCircle2 } from "lucide-react";

interface DoneStepProps {
  pensionerName: string;
}

export function DoneStep({ pensionerName }: DoneStepProps) {
  return (
    <div className='text-center space-y-5 py-6'>
      <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto'>
        <CheckCircle2 className='w-8 h-8 text-green-600' />
      </div>

      <div className='space-y-2'>
        <h3 className='text-[17px] font-bold text-[#0c190c]'>
          Report submitted
        </h3>
        <p className='text-[12px] text-[#001407]/55 max-w-xs mx-auto leading-relaxed'>
          The death report for <strong>{pensionerName}</strong> has been
          submitted. Pension payments have been paused pending review.
        </p>
      </div>

      <div className='p-4 rounded-xl bg-[#f0f7f0] border border-[#001407]/10 text-left space-y-2'>
        <p className='text-[11px] font-semibold text-[#0c190c]'>
          What happens next?
        </p>
        <ul className='text-[11px] text-[#001407]/55 space-y-1.5'>
          <li>
            • A pension officer will review the claim within 3–5 working days
          </li>
          <li>
            • You may be contacted at the phone number on file to verify details
          </li>
          <li>
            • If approved, the account will be formally marked as deceased
          </li>
          <li>
            • Bring the original death certificate to your local pension office
          </li>
        </ul>
      </div>

      <p className='text-[10px] text-[#001407]/30'>
        You can close this page. No further action is needed at this time.
      </p>
    </div>
  );
}
