import { AlertCircle } from "lucide-react";
import { Label } from "../ui/label";

export default function FF({
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
      <Label className='text-xs font-medium'>
        {label}
        {required && <span className='text-destructive ml-0.5'>*</span>}
      </Label>
      {children}
      {error && (
        <p className='text-xs text-destructive flex items-center gap-1'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {error}
        </p>
      )}
    </div>
  );
}
