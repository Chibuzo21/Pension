"use client";

import { cn } from "@/lib/utils";
import { Mic, Camera, ShieldCheck, ShieldAlert } from "lucide-react";

interface Pensioner {
  biometricLevel: string;
  faceEnrolled?: boolean;
  voiceEnrolled?: boolean;
  status: string;
}

const LEVEL_META: Record<
  string,
  { label: string; color: string; ring: string; desc: string }
> = {
  L3: {
    label: "L3 — Full",
    color: "text-emerald-700 bg-emerald-50",
    ring: "ring-emerald-200",
    desc: "Face + voice enrolled",
  },
  L2: {
    label: "L2 — Partial",
    color: "text-blue-700 bg-blue-50",
    ring: "ring-blue-200",
    desc: "Face enrolled only",
  },
  L1: {
    label: "L1 — Minimal",
    color: "text-amber-700 bg-amber-50",
    ring: "ring-amber-200",
    desc: "Voice enrolled only",
  },
  L0: {
    label: "L0 — None",
    color: "text-slate-600 bg-slate-100",
    ring: "ring-slate-200",
    desc: "No biometrics on file",
  },
};

interface BiometricPillProps {
  label: string;
  icon: React.ReactNode;
  enrolled: boolean;
}

function BiometricPill({ label, icon, enrolled }: BiometricPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold",
        enrolled
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
      )}>
      {icon}
      {label}
      <span className='ml-1 font-bold'>{enrolled ? "✓" : "–"}</span>
    </div>
  );
}

export function BiometricStatusCard({ pensioner }: { pensioner: Pensioner }) {
  const level = pensioner.biometricLevel ?? "L0";
  const meta = LEVEL_META[level] ?? LEVEL_META.L0;
  const isComplete = level === "L3";

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap",
        isComplete
          ? "bg-emerald-50/60 border-emerald-200"
          : "bg-amber-50/60 border-amber-200",
      )}>
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isComplete ? "bg-emerald-100" : "bg-amber-100",
        )}>
        {isComplete ? (
          <ShieldCheck className='h-4 w-4 text-emerald-600' />
        ) : (
          <ShieldAlert className='h-4 w-4 text-amber-600' />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <p
          className={cn(
            "text-[12px] font-bold",
            isComplete ? "text-emerald-800" : "text-amber-800",
          )}>
          {isComplete
            ? "Biometrics fully enrolled"
            : "Biometric enrollment incomplete"}
        </p>
        <p
          className={cn(
            "text-[10px] mt-0.5",
            isComplete ? "text-emerald-600" : "text-amber-600",
          )}>
          {meta.desc}
        </p>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <BiometricPill
          label='Face'
          icon={<Camera className='h-3 w-3' />}
          enrolled={!!pensioner.faceEnrolled}
        />
        <BiometricPill
          label='Voice'
          icon={<Mic className='h-3 w-3' />}
          enrolled={!!pensioner.voiceEnrolled}
        />
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold ring-1",
            meta.color,
            meta.ring,
          )}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}
