import { cn } from "@/lib/utils";

export function ScoreRow({
  label,
  score,
  threshold,
}: {
  label: string;
  score: number;
  threshold: number;
}) {
  const pct = Math.round(score * 100);
  const pass = score >= threshold;
  return (
    <div>
      <div className='flex items-center justify-between text-[10px] mb-0.5'>
        <span className='text-(--muted-foreground)'>{label}</span>
        <span
          className={cn(
            "font-bold",
            pass ? "text-emerald-600" : "text-red-500",
          )}>
          {pct}%
        </span>
      </div>
      <div className='h-1.5 bg-(--muted) rounded-full overflow-hidden'>
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pass ? "bg-emerald-500" : "bg-red-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
