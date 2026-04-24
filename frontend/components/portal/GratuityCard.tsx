// ── GratuityCard ───────────────────────────────────────────────────
import { formatNaira } from "@/lib/utils";
import { CreditCard, Building2 } from "lucide-react";

interface Pensioner {
  gratuityAmount: number;
  gratuityPaid: number;
  bankName?: string | null;
  accountNumber?: string | null;
}

export function GratuityCard({ pensioner }: { pensioner: Pensioner }) {
  const balance = pensioner.gratuityAmount - pensioner.gratuityPaid;
  const paidPct =
    pensioner.gratuityAmount > 0
      ? Math.round((pensioner.gratuityPaid / pensioner.gratuityAmount) * 100)
      : 0;

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <CreditCard className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>Gratuity Summary</span>
      </div>

      <div className='p-4 space-y-4'>
        {/* Three stat cells */}
        <div className='grid grid-cols-3 gap-2'>
          {[
            {
              label: "Total",
              value: formatNaira(pensioner.gratuityAmount),
              style: "bg-offwhite",
              text: "text-ink",
            },
            {
              label: "Paid",
              value: formatNaira(pensioner.gratuityPaid),
              style: "bg-offwhite",
              text: "text-ink",
            },
            {
              label: "Balance",
              value: formatNaira(balance),
              style: "bg-emerald-50 ring-1 ring-emerald-100",
              text: "text-emerald-700",
            },
          ].map(({ label, value, style, text }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${style}`}>
              <p className='text-[9px] font-bold uppercase tracking-wider text-slate mb-1'>
                {label}
              </p>
              <p
                className={`text-[11px] font-bold tabular-nums leading-tight ${text}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className='flex justify-between items-center mb-1.5'>
            <span className='text-[10px] text-slate'>Payment progress</span>
            <span className='text-[10px] font-bold text-g1'>{paidPct}%</span>
          </div>
          <div className='h-1.5 bg-smoke rounded-full overflow-hidden'>
            <div
              className='h-full bg-g1 rounded-full transition-all duration-500'
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>

        {/* Bank info */}
        {pensioner.bankName && (
          <div className='flex items-center gap-2 pt-1 border-t border-smoke'>
            <Building2 className='h-3.5 w-3.5 text-slate shrink-0' />
            <span className='text-[11px] text-slate'>
              {pensioner.bankName}
              {pensioner.accountNumber && (
                <span className='font-mono ml-1.5 text-ink'>
                  ···{pensioner.accountNumber.slice(-4)}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
