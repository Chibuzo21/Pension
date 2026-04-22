"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple";
  compact?: boolean;
}

const colorMap = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    ring: "ring-blue-100",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    ring: "ring-emerald-100",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    ring: "ring-amber-100",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    ring: "ring-red-100",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    ring: "ring-purple-100",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  compact = false,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card className={cn("border shadow-sm", compact && "border-dashed")}>
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium text-muted-foreground truncate'>
              {title}
            </p>
            <p
              className={cn(
                "font-bold text-foreground mt-0.5 tabular-nums",
                compact ? "text-xl" : "text-2xl",
              )}>
              {value}
            </p>
            {subtitle && (
              <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "p-2 rounded-lg shrink-0 ring-1",
                colors.icon,
                colors.ring,
              )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
