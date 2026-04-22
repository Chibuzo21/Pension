import { cn } from "@/lib/utils";

export default function ScoreCard({
  icon,
  label,
  score,
  passed,
  weight,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  passed: boolean;
  weight: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 border",
        passed
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200",
      )}>
      <div
        className={cn(
          "flex items-center gap-1 text-[10px] font-semibold mb-2",
          passed ? "text-emerald-600" : "text-red-500",
        )}>
        {icon}
        {label}
        <span className='ml-auto text-[9px] font-normal text-(--muted-foreground)'>
          {weight}
        </span>
      </div>
      <p className='text-xl font-black tabular-nums'>
        {(score * 100).toFixed(0)}%
      </p>
    </div>
  );
}
