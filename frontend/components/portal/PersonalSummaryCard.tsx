"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { User, Phone, Mail, MapPin } from "lucide-react";

interface Pensioner {
  fullName: string;
  dob?: string | null;
  nin?: string | null;
  bvn?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: string;
  biometricLevel: string;
  pensionId?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  deceased: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  suspended: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  flagged: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

function InfoCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className='bg-white px-4 py-3'>
      <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5'>
        {label}
      </p>
      <p className='text-[12px] font-medium text-slate-800 truncate'>
        {value ?? "—"}
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className='flex items-center gap-2 text-[11px] text-slate-600'>
      <Icon className='h-3 w-3 text-slate-400 shrink-0' />
      <span className='truncate'>{value}</span>
    </div>
  );
}

export function PersonalSummaryCard({ pensioner }: { pensioner: Pensioner }) {
  const initials = pensioner.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  const hasContact = pensioner.phone || pensioner.email || pensioner.address;

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <User className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>
          Personal Information
        </span>
      </div>

      {/* Avatar + name hero */}
      <div className='px-4 pt-4 pb-3 flex items-center gap-3 border-b border-smoke'>
        <div className='w-12 h-12 rounded-xl bg-g1 flex items-center justify-center text-white font-bold text-base shrink-0'>
          {initials}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-[14px] font-bold text-ink leading-tight truncate'>
            {pensioner.fullName}
          </p>
          {pensioner.pensionId && (
            <p className='text-[10px] text-slate-400 font-mono mt-0.5'>
              ID: {pensioner.pensionId}
            </p>
          )}
          <div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize",
                STATUS_STYLES[pensioner.status] ??
                  "bg-slate-100 text-slate-600",
              )}>
              {pensioner.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className='grid grid-cols-2 gap-px bg-smoke'>
        <InfoCell
          label='Date of Birth'
          value={
            pensioner.dob
              ? format(new Date(pensioner.dob), "dd MMM yyyy")
              : null
          }
        />
        <InfoCell
          label='NIN'
          value={pensioner.nin ? `···${pensioner.nin.slice(-4)}` : null}
        />
        <InfoCell
          label='BVN'
          value={pensioner.bvn ? `···${pensioner.bvn.slice(-4)}` : null}
        />
      </div>

      {/* Contact info */}
      {hasContact && (
        <div className='px-4 py-3 border-t border-smoke space-y-1.5'>
          <p className='text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2'>
            Contact
          </p>
          <ContactRow icon={Phone} value={pensioner.phone} />
          <ContactRow icon={Mail} value={pensioner.email} />
          <ContactRow icon={MapPin} value={pensioner.address} />
        </div>
      )}
    </div>
  );
}
