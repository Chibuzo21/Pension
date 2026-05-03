import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = "lookup" | "confirm" | "details" | "done";

export const STEPS: { key: Step; label: string }[] = [
  { key: "lookup", label: "Find Account" },
  { key: "confirm", label: "Confirm Identity" },
  { key: "details", label: "Death Report" },
  { key: "done", label: "Submitted" },
];

export function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className='flex items-center gap-0 mb-8'>
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className='flex items-center gap-0 flex-1'>
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  done && "bg-[#004d19] text-white",
                  active &&
                    "bg-[#001407] text-white ring-2 ring-[#001407]/20 ring-offset-2",
                  !done && !active && "bg-[#001407]/10 text-[#001407]/40",
                )}>
                {done ? <CheckCircle2 className='w-4 h-4' /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] mt-1 font-semibold tracking-wide uppercase",
                  active ? "text-[#001407]" : "text-[#001407]/35",
                )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mb-4 mx-1 transition-all",
                  i < idx ? "bg-[#004d19]" : "bg-[#001407]/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
