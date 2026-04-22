import { cn } from "@/lib/utils";

/* ── InfoField ─────────────────────────────────────── */
interface InfoFieldProps {
  label: string;
  value?: string | null;
  mono?: boolean;
  highlight?: boolean;
  className?: string;
}

export function InfoField({
  label,
  value,
  mono,
  highlight,
  className,
}: InfoFieldProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className='text-[9px] font-bold uppercase tracking-[0.6px] text-muted-foreground'>
        {label}
      </span>
      <span
        className={cn(
          "text-[12px]",
          mono && "font-mono",
          highlight
            ? "font-bold text-green-700"
            : value
              ? "text-foreground"
              : "text-muted-foreground",
        )}>
        {value ?? "—"}
      </span>
    </div>
  );
}

/* ── InfoGrid ──────────────────────────────────────── */
export function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className='grid grid-cols-2 gap-3'>{children}</div>;
}

/* ── InfoSection ───────────────────────────────────── */
export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-border bg-card shadow-sm'>
      <div className='border-b border-border px-4 py-2.5'>
        <h3 className='text-[11px] font-semibold text-foreground'>{title}</h3>
      </div>
      <div className='p-4'>{children}</div>
    </div>
  );
}
