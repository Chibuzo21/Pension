import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ActionCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: "primary" | "blue" | "slate";
}

const colorMap = {
  primary: "bg-g1 border-g1 text-white",
  blue: "bg-blue-600 border-blue-600 text-white",
  slate: "bg-slate-700 border-slate-700 text-white",
};

export default function ActionCard({
  href,
  icon,
  label,
  sub,
  color,
}: ActionCardProps) {
  return (
    <Link href={href} className='block'>
      <div
        className={cn(
          "relative rounded-xl p-3.5 flex flex-col gap-2.5 h-full border",
          "transition-all duration-150 hover:shadow-md hover:-translate-y-px cursor-pointer overflow-hidden",
          colorMap[color],
        )}>
        <div className='absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10 bg-white' />

        <div className='w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0'>
          {icon}
        </div>

        <div className='flex-1 min-w-0'>
          <p className='text-[12px] font-bold leading-tight'>{label}</p>
          <p className='text-[10px] mt-0.5 opacity-75'>{sub}</p>
        </div>

        <ArrowRight className='h-3 w-3 opacity-60 self-end' />
      </div>
    </Link>
  );
}
