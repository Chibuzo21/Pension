import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  hintIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a form control with a consistent label, inline error, and hint text.
 * Designed to work with React Hook Form — pass `error={errors.fieldName?.message}`.
 */
export function FormField({
  label,
  required,
  error,
  hint,
  hintIcon,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className='text-[11px] font-semibold text-[#2a3a2a] tracking-wide uppercase block'>
        {label}
        {required && " *"}
      </label>

      {children}

      {/* Inline error — shown when field has an error */}
      {error && (
        <p className='text-[11px] text-red-500 font-medium flex items-start gap-1.5'>
          <AlertCircle className='w-3 h-3 shrink-0 mt-0.5' />
          {error}
        </p>
      )}

      {/* Hint — only shown when there's no error */}
      {!error && hint && (
        <div className='flex gap-1.5 items-start'>
          {hintIcon && (
            <span className='shrink-0 mt-0.5 text-[#001407]/30'>
              {hintIcon}
            </span>
          )}
          <p className='text-[10px] text-[#001407]/40 leading-relaxed'>
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
