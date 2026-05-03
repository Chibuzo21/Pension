// components/onboarding/FormField.tsx
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FF({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-[11px] font-semibold text-[#2a3a2a] tracking-wide uppercase'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {children}
      {error && (
        <p className='text-[11px] text-red-500 font-medium flex items-center gap-1'>
          <AlertCircle className='w-3 h-3 shrink-0' />
          {error}
        </p>
      )}
    </div>
  );
}

export function SectionHead({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className='flex items-center gap-3 mb-5 pb-4 border-b border-[#001407]/8'>
      <div className='w-8 h-8 rounded-lg bg-[#001407]/6 flex items-center justify-center shrink-0'>
        <Icon className='w-4 h-4 text-[#001407]/50' />
      </div>
      <div>
        <p className='text-[13px] font-bold text-[#0c190c]'>{title}</p>
        <p className='text-[11px] text-[#0c190c]/45'>{subtitle}</p>
      </div>
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
