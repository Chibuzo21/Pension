import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "@/convex/_generated/dataModel";

const levelColor: Record<string, string> = {
  L0: "bg-slate-100 text-slate-600",
  L1: "bg-orange-100 text-orange-700",
  L2: "bg-blue-100 text-blue-700",
  L3: "bg-violet-100 text-violet-700",
};
export default function EnrollTopBar({
  pensioner,
  pensionerId,
}: {
  pensioner: Doc<"pensioners">;
  pensionerId: Id<"pensioners">;
}) {
  return (
    <div className='bg-white border-b border-mist px-4 py-3 flex items-center gap-3 sticky top-0 z-10'>
      <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0' asChild>
        <Link href={`/dashboard/admin/pensioners/${pensionerId}`}>
          <ArrowLeft className='h-4 w-4' />
        </Link>
      </Button>
      <div className='flex-1 min-w-0'>
        <h2 className='text-sm font-bold text-ink'>Biometric Enrolment</h2>
        <p className='text-[11px] text-muted-foreground truncate'>
          {pensioner.fullName} · {pensioner.pensionId}
        </p>
      </div>
      <Badge
        variant='outline'
        className={`text-[10px] shrink-0 ${levelColor[pensioner.biometricLevel ?? "L0"]}`}>
        {pensioner.biometricLevel ?? "L0"}
      </Badge>
    </div>
  );
}
