import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Variant = "warning" | "error" | "success" | "info";

const VARIANT_STYLES: Record<
  Variant,
  {
    wrapper: string;
    icon: string;
    title: string;
    body: string;
    Icon: typeof AlertTriangle;
  }
> = {
  warning: {
    wrapper: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-800",
    body: "text-amber-700",
    Icon: AlertTriangle,
  },
  error: {
    wrapper: "bg-red-50 border-red-200",
    icon: "text-red-500",
    title: "text-red-800",
    body: "text-red-600",
    Icon: AlertCircle,
  },
  success: {
    wrapper: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-800",
    body: "text-green-700",
    Icon: CheckCircle2,
  },
  info: {
    wrapper: "bg-[#f0f7f0] border-[#001407]/10",
    icon: "text-[#004d19]",
    title: "text-[#0c190c]",
    body: "text-[#001407]/55",
    Icon: Info,
  },
};

interface InfoBannerProps {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
  center?: boolean;
}

export function InfoBanner({
  variant = "info",
  title,
  children,
  className,
  center = false,
}: InfoBannerProps) {
  const styles = VARIANT_STYLES[variant];
  const { Icon } = styles;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        styles.wrapper,
        center && "text-center",
        className,
      )}>
      <div className={cn("flex gap-2.5", center && "justify-center")}>
        {!center && (
          <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", styles.icon)} />
        )}
        <div className={cn(center && "space-y-2")}>
          {title && (
            <p className={cn("text-[12px] font-semibold", styles.title)}>
              {title}
            </p>
          )}
          <div
            className={cn("text-[11px] leading-relaxed mt-0.5", styles.body)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
