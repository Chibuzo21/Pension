import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { PensionerStatus, STATUS_STYLE, LEVEL_STYLE } from "@/types/pensioner";

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className='flex justify-between items-start gap-3 py-[9px] border-b border-white/5 last:border-0'>
      <span className='text-[10px] font-bold uppercase tracking-widest text-white/30 flex-shrink-0 pt-0.5'>
        {label}
      </span>
      <span className='text-[12px] font-medium text-white/80 text-right font-mono'>
        {value ?? (
          <span className='text-white/20 font-sans font-normal'>—</span>
        )}
      </span>
    </div>
  );
}

export function InfoRowLight({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className='flex justify-between items-start gap-3 py-[9px] border-b border-[#dce6dc] last:border-0'>
      <span className='text-[10px] font-bold uppercase tracking-widest text-[#768876] flex-shrink-0 pt-0.5'>
        {label}
      </span>
      <span className='text-[12px] font-medium text-[#0c190c] text-right'>
        {value ?? <span className='text-[#768876] font-normal'>—</span>}
      </span>
    </div>
  );
}

const STATUS_CONFIG: Record<
  PensionerStatus,
  { icon: React.ReactNode; classes: string }
> = {
  active: {
    icon: <CheckCircle2 className='h-3 w-3' />,
    classes: "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  },
  dormant: {
    icon: <Clock className='h-3 w-3' />,
    classes: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
  },
  suspended: {
    icon: <AlertTriangle className='h-3 w-3' />,
    classes: "bg-[#fff7ed] text-[#c2410c] border-[#fdba74]",
  },
  incapacitated: {
    icon: <ShieldAlert className='h-3 w-3' />,
    classes: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  },
  deceased: {
    icon: <XCircle className='h-3 w-3' />,
    classes: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
  },
  flagged: {
    icon: <AlertTriangle className='h-3 w-3' />,
    classes: "bg-[#fffbeb] text-[#92400e] border-[#fbbf24]",
  },
};

export function StatusPill({ status }: { status: PensionerStatus }) {
  const { icon, classes } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize tracking-wide",
        classes,
      )}>
      {icon}
      {status}
    </span>
  );
}

const LEVEL_MAP: Record<string, string> = {
  L0: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]",
  L1: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  L2: "bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]",
  L3: "bg-[#faf5ff] text-[#6d28d9] border-[#ddd6fe]",
};

export function LevelChip({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full border",
        LEVEL_MAP[level] ?? LEVEL_MAP.L0,
      )}>
      {level}
    </span>
  );
}

export function Initials({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  if (size === "sm") {
    return (
      <div className='h-9 w-9 rounded-xl bg-[#dce6dc] flex items-center justify-center text-[#003311] font-bold text-xs shrink-0'>
        {letters}
      </div>
    );
  }
  return (
    <div className='h-16 w-16 rounded-2xl bg-[#003311] flex items-center justify-center text-[#c8960c] font-black text-xl shrink-0 border-2 border-[#c8960c]/30'>
      {letters}
    </div>
  );
}
