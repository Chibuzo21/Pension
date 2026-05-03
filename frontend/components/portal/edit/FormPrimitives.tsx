// Shared tiny primitives reused by all edit sections
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function FF({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-[11px] font-semibold text-[#2a3a2a] tracking-wide uppercase'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {children}
      {hint && !error && <p className='text-[10px] text-slate-400'>{hint}</p>}
      {error && (
        <p className='text-[11px] text-red-500 font-medium flex items-center gap-1'>
          <AlertCircle className='w-3 h-3 shrink-0' />
          {error}
        </p>
      )}
    </div>
  );
}

export const fi = (err?: boolean) =>
  cn(
    "w-full h-9 text-[12px] border border-[#001407]/15 bg-white rounded-lg px-3",
    "focus:outline-none focus:ring-1 focus:ring-[#004d19]/40 focus:border-[#004d19]/50",
    "placeholder:text-[#001407]/25 transition-all",
    err && "border-red-400 focus:ring-red-300",
  );

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5'>
      <div className='flex items-center gap-3 mb-5 pb-4 border-b border-[#001407]/8'>
        <div className='w-8 h-8 rounded-lg bg-[#001407]/6 flex items-center justify-center shrink-0'>
          <Icon className='w-4 h-4 text-[#001407]/50' />
        </div>
        <div>
          <p className='text-[13px] font-bold text-[#0c190c]'>{title}</p>
          <p className='text-[11px] text-[#0c190c]/45'>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
