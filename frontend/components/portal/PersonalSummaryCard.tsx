// ── PersonalSummaryCard ────────────────────────────────────────────
import { format } from "date-fns";
import { cn, statusBadge, biometricLevelBadge } from "@/lib/utils";
import { User } from "lucide-react";

interface InfoRowProps {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}

export function InfoRow({ label, value, children }: InfoRowProps) {
  return (
    <div className='flex flex-col gap-0.5 min-w-0'>
      <p className='text-[9px] font-bold uppercase tracking-wider text-slate'>
        {label}
      </p>
      {children ?? (
        <p className='text-[12px] font-medium text-ink truncate'>
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  deceased: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  suspended: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  flagged: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const BIO_STYLES: Record<string, string> = {
  L3: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  L2: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  L1: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  L0: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

interface Pensioner {
  fullName: string;
  dob?: string | null;
  lastMda?: string | null;
  subTreasury?: string | null;
  status: string;
  biometricLevel: string;
}

export function PersonalSummaryCard({ pensioner }: { pensioner: Pensioner }) {
  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <User className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>My Information</span>
      </div>

      {/* Avatar + name hero */}
      <div className='px-4 pt-4 pb-3 flex items-center gap-3 border-b border-smoke'>
        <div className='w-11 h-11 rounded-xl bg-g1 flex items-center justify-center text-white font-bold text-base shrink-0'>
          {pensioner.fullName
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </div>
        <div className='min-w-0'>
          <p className='text-[14px] font-bold text-ink leading-tight truncate'>
            {pensioner.fullName}
          </p>
          <div className='flex items-center gap-1.5 mt-1 flex-wrap'>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize",
                STATUS_STYLES[pensioner.status] ??
                  "bg-slate-100 text-slate-600",
              )}>
              {pensioner.status}
            </span>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold",
                BIO_STYLES[pensioner.biometricLevel] ??
                  "bg-slate-100 text-slate-500",
              )}>
              {pensioner.biometricLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className='grid grid-cols-2 gap-px bg-smoke'>
        {[
          {
            label: "Date of Birth",
            value: pensioner.dob
              ? format(new Date(pensioner.dob), "dd MMM yyyy")
              : null,
          },
          { label: "MDA", value: pensioner.lastMda },
          { label: "Sub-Treasury", value: pensioner.subTreasury },
        ].map(({ label, value }) => (
          <div key={label} className='bg-white px-4 py-3'>
            <InfoRow label={label} value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}
