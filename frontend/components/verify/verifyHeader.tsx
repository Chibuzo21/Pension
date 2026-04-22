import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyHeaderProps {
  pensionerId: string;
  fullName?: string;
  pensionCode?: string;
}

export function VerifyHeader({
  pensionerId,
  fullName,
  pensionCode,
}: VerifyHeaderProps) {
  return (
    <div className='flex items-center gap-3'>
      <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
        <Link href={`/dashboard/admin/pensioners/${pensionerId}`}>
          <ArrowLeft className='h-4 w-4' />
        </Link>
      </Button>
      <div>
        <h2 className='text-lg font-semibold'>
          Multi-Modal Biometric Verification
        </h2>
        <p className='text-sm text-muted-foreground'>
          {fullName ?? "…"} · {pensionCode ?? ""}
        </p>
      </div>
    </div>
  );
}
