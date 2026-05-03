"use client";

import { format } from "date-fns";
import { Building, Calendar, MapPin } from "lucide-react";

interface Pensioner {
  lastMda?: string | null;
  subTreasury?: string | null;
  dateOfEmployment?: string | null;
  dateOfRetirement?: string | null;
}

function ServiceRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className='flex items-start gap-3 py-2.5'>
      <div className='w-6 h-6 rounded-md bg-g1/8 flex items-center justify-center shrink-0 mt-0.5'>
        <Icon className='h-3 w-3 text-g1/60' />
      </div>
      <div className='min-w-0'>
        <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>
          {label}
        </p>
        <p className='text-[12px] font-medium text-slate-800 mt-0.5'>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function formatDateSafe(d?: string | null) {
  if (!d) return null;
  try {
    return format(new Date(d), "dd MMM yyyy");
  } catch {
    return d;
  }
}

export function ServiceRecordCard({ pensioner }: { pensioner: Pensioner }) {
  // Don't render if no service data at all
  const hasData =
    pensioner.lastMda ||
    pensioner.subTreasury ||
    pensioner.dateOfEmployment ||
    pensioner.dateOfRetirement;

  if (!hasData) return null;

  const yearsOfService = (() => {
    if (!pensioner.dateOfEmployment || !pensioner.dateOfRetirement) return null;
    const start = new Date(pensioner.dateOfEmployment);
    const end = new Date(pensioner.dateOfRetirement);
    const diff =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return diff > 0 ? Math.floor(diff) : null;
  })();

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <Building className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>Service Record</span>
        {yearsOfService && (
          <span className='ml-auto text-[10px] px-2 py-0.5 bg-g1/8 text-g1 rounded-full font-semibold'>
            {yearsOfService} yrs service
          </span>
        )}
      </div>

      <div className='px-4 divide-y divide-smoke'>
        <ServiceRow
          icon={Building}
          label='Last MDA'
          value={pensioner.lastMda}
        />
        <ServiceRow
          icon={MapPin}
          label='Sub-Treasury / Station'
          value={pensioner.subTreasury}
        />
        <ServiceRow
          icon={Calendar}
          label='Date of Employment'
          value={formatDateSafe(pensioner.dateOfEmployment)}
        />
        <ServiceRow
          icon={Calendar}
          label='Date of Retirement'
          value={formatDateSafe(pensioner.dateOfRetirement)}
        />
      </div>
    </div>
  );
}
