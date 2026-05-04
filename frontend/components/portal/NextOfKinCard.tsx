"use client";

import { Users, Phone, MapPin, UserCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface NextOfKinCardProps {
  pensionerId: Id<"pensioners">;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  spouse: "bg-pink-50 text-pink-700 ring-1 ring-pink-200",
  son: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  daughter: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  brother: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  sister: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  friend: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

function NokRow({
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

function NokEntry({
  nok,
  index,
}: {
  nok: {
    fullName: string;
    relationship: string;
    phone?: string | null;
    address?: string | null;
  };
  index: number;
}) {
  const relationshipKey = nok.relationship.toLowerCase();
  const badgeStyle =
    RELATIONSHIP_COLORS[relationshipKey] ??
    "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  const initials = nok.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={cn("px-4 py-3", index > 0 && "border-t border-smoke")}>
      <div className='flex items-center gap-3 mb-2'>
        <div className='w-8 h-8 rounded-lg bg-g1/10 flex items-center justify-center text-g1 font-bold text-[11px] shrink-0'>
          {initials}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-[12px] font-semibold text-slate-800 truncate'>
            {nok.fullName}
          </p>
          <span
            className={cn(
              "inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize",
              badgeStyle,
            )}>
            {nok.relationship}
          </span>
        </div>
        <div className='shrink-0'>
          <UserCheck className='h-3.5 w-3.5 text-emerald-500' />
        </div>
      </div>

      <div className='pl-11 space-y-1'>
        <NokRow icon={Phone} value={nok.phone} />
        <NokRow icon={MapPin} value={nok.address} />
      </div>
    </div>
  );
}

export function NextOfKinCard({ pensionerId }: NextOfKinCardProps) {
  const nokList = useQuery(api.nextOfKin.listForPensioner, { pensionerId });

  // Still loading
  if (nokList === undefined) return null;

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <Users className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>Next of Kin</span>
        {nokList.length > 0 && (
          <span className='ml-auto text-[10px] px-2 py-0.5 bg-g1/8 text-g1 rounded-full font-semibold'>
            {nokList.length} registered
          </span>
        )}
      </div>

      {/* No NOK registered */}
      {nokList.length === 0 ? (
        <div className='px-4 py-4 flex items-start gap-3'>
          <div className='w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5'>
            <AlertTriangle className='h-3.5 w-3.5 text-amber-500' />
          </div>
          <div>
            <p className='text-[12px] font-semibold text-slate-700'>
              No next of kin on file
            </p>
            <p className='text-[11px] text-slate-400 mt-0.5 leading-relaxed'>
              Adding a next of kin ensures your family can report your death and
              manage your pension claim when the time comes.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {nokList.map((nok, i) => (
            <NokEntry key={nok._id} nok={nok} index={i} />
          ))}
        </div>
      )}

      {/* Footer note — NIN intentionally not shown */}
      <div className='px-4 py-2.5 border-t border-smoke bg-slate-50/60'>
        <p className='text-[10px] text-slate-400 leading-relaxed'>
          Next of kin details are used to verify identity when reporting a
          death. To update this information, visit your local pension office.
        </p>
      </div>
    </div>
  );
}
