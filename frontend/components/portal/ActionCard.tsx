// ── ActionCard ─────────────────────────────────────────────────────
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ActionCard({
  href,
  icon,
  label,
  sub,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: "primary" | "blue";
}) {
  const isPrimary = color === "primary";

  return (
    <Link href={href} className='block'>
      <div
        className={cn(
          "relative rounded-xl p-4 flex flex-col gap-3 h-full border transition-all duration-150 hover:shadow-md hover:-translate-y-px cursor-pointer overflow-hidden",
          isPrimary
            ? "bg-g1 border-g1 text-white"
            : "bg-blue-600 border-blue-600 text-white",
        )}>
        {/* Decorative circle */}
        <div
          className={cn(
            "absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white",
          )}
        />

        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            isPrimary ? "bg-white/15" : "bg-white/15",
          )}>
          {icon}
        </div>

        <div className='flex-1 min-w-0'>
          <p className='text-[13px] font-bold leading-tight'>{label}</p>
          <p className='text-[10px] mt-0.5 opacity-75'>{sub}</p>
        </div>

        <ArrowRight className='h-3.5 w-3.5 opacity-60 self-end' />
      </div>
    </Link>
  );
}
