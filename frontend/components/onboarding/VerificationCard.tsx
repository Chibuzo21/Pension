import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type VerificationCardProps = {
  name: string;
  pensionId: string;
  error: string;
  loading: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

export function VerificationCard({
  name,
  pensionId,
  error,
  loading,
  onConfirm,
  onBack,
}: VerificationCardProps) {
  return (
    <div className='space-y-5'>
      <div className='flex gap-3 bg-[#f0faf0] border border-[#004d19]/30 rounded-[9px] px-4 py-4'>
        <CheckCircle2 className='w-5 h-5 text-[#004d19] shrink-0 mt-0.5' />
        <div>
          <p className='text-[12px] font-semibold text-[#004d19] mb-0.5'>
            Pension record found
          </p>
          <p className='text-[13px] font-medium text-[#0c190c]'>{name}</p>
          <p className='text-[11px] text-muted-foreground font-mono mt-0.5'>
            {pensionId}
          </p>
        </div>
      </div>

      <p className='text-[12px] text-muted-foreground'>
        Is this you? Confirm to link this record to your account.
      </p>

      {error && (
        <div className='flex items-center gap-1.5'>
          <AlertCircle className='w-3 h-3 text-destructive shrink-0' />
          <p className='text-[11px] text-destructive'>{error}</p>
        </div>
      )}

      <div className='flex gap-3'>
        <button
          onClick={onBack}
          disabled={loading}
          className='px-4 py-3 rounded-[9px] border border-border text-[13px] text-[#4a5e4a] hover:bg-[#f0faf0] transition-colors disabled:opacity-50'>
          ← Back
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className='flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[9px] text-[13.5px] font-semibold text-white bg-[#004d19] hover:bg-[#003311] hover:-translate-y-px active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0'>
          {loading ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              Linking account…
            </>
          ) : (
            <>
              Yes, link my account
              <ArrowRight className='w-4 h-4' />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
