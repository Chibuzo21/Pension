import { ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

type NinInputProps = {
  nin: string;
  error: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NinInput({
  nin,
  error,
  loading,
  onChange,
  onSubmit,
}: NinInputProps) {
  const ninLength = nin.trim().length;
  const isComplete = ninLength === 11;

  return (
    <form onSubmit={onSubmit} className='space-y-5'>
      <div>
        <label className='block text-[11px] font-semibold text-[#0c190c] uppercase tracking-[0.8px] mb-2'>
          National Identification Number (NIN)
        </label>

        <div className='relative'>
          <input
            value={nin}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder='e.g. AB12345678C'
            maxLength={11}
            autoFocus
            className={`
              w-full px-4 py-3 pr-16
              font-mono text-[15px] tracking-[3px] uppercase
              border-[1.5px] rounded-[9px] outline-none
              bg-white transition-all duration-150
              placeholder:tracking-normal placeholder:font-sans placeholder:text-[13px] placeholder:text-[#a0b0a0]
              ${
                error
                  ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/10"
                  : isComplete
                    ? "border-[#004d19] focus:border-[#004d19] focus:ring-2 focus:ring-[#004d19]/10"
                    : "border-border focus:border-[#004d19] focus:ring-2 focus:ring-[#004d19]/10"
              }
            `}
          />
          <span
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums transition-colors ${
              isComplete ? "text-[#004d19]" : "text-[#a0b0a0]"
            }`}>
            {ninLength}/11
          </span>
        </div>

        {/* Progress dots */}
        <div className='flex gap-1 mt-2.5'>
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                i < ninLength
                  ? error
                    ? "bg-destructive"
                    : "bg-[#004d19]"
                  : "bg-border"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className='flex items-center gap-1.5 mt-2'>
            <AlertCircle className='w-3 h-3 text-destructive shrink-0' />
            <p className='text-[11px] text-destructive'>{error}</p>
          </div>
        )}
      </div>

      <div className='flex gap-3 bg-[#f0faf0] border border-[#c6e8c6] rounded-[9px] px-4 py-3'>
        <ShieldCheck className='w-4 h-4 text-[#004d19] shrink-0 mt-0.5' />
        <p className='text-[11.5px] text-[#4a5e4a] leading-relaxed'>
          Your NIN is encrypted and only used to locate your pension record. It
          will not be shared with third parties.
        </p>
      </div>

      <button
        type='submit'
        disabled={loading || !isComplete}
        className={`
          w-full flex items-center justify-center gap-2
          py-3 px-6 rounded-[9px]
          text-[13.5px] font-semibold text-white
          transition-all duration-150
          ${
            loading || !isComplete
              ? "bg-[#004d19]/40 cursor-not-allowed"
              : "bg-[#004d19] hover:bg-[#003311] hover:-translate-y-px active:translate-y-0 cursor-pointer"
          }
        `}>
        {loading ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            Checking your record…
          </>
        ) : (
          <>
            Verify NIN
            <ArrowRight className='w-4 h-4' />
          </>
        )}
      </button>
    </form>
  );
}
