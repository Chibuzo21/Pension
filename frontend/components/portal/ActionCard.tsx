import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";

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
  return (
    <Link href={href}>
      <Card className='hover:shadow-md transition-shadow cursor-pointer h-full'>
        <CardContent className='px-4 py-5 flex flex-col gap-3'>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              color === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-blue-50 text-blue-600",
            )}>
            {icon}
          </div>
          <div>
            <p className='text-sm font-semibold'>{label}</p>
            <p className='text-xs text-(--muted-foreground) mt-0.5'>{sub}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
