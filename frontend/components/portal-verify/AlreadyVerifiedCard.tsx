import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface Verification {
  _creationTime: number;
  fusedScore?: number;
}

interface Props {
  pensionerName: string;
  currentMonth: string;
  verification: Verification;
}

export function AlreadyVerifiedCard({
  pensionerName,
  currentMonth,
  verification,
}: Props) {
  const verifiedOn = new Date(verification._creationTime);
  const nextDue = new Date(
    verifiedOn.getFullYear(),
    verifiedOn.getMonth() + 1,
    1,
  );

  return (
    <Card className='border-2 border-emerald-500'>
      <CardContent className='px-6 py-8 text-center space-y-5'>
        <CheckCircle2 className='h-20 w-20 text-emerald-500 mx-auto' />
        <div>
          <p className='text-2xl font-black'>Already Verified ✓</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {pensionerName} · {currentMonth}
          </p>
        </div>
        <div className='bg-muted/40 rounded-xl p-4 space-y-1'>
          <p className='text-xs text-muted-foreground'>
            Fused score this month
          </p>
          <p className='text-4xl font-black tabular-nums text-emerald-600'>
            {((verification.fusedScore ?? 0) * 100).toFixed(1)}%
          </p>
          <p className='text-xs text-muted-foreground'>
            Verified on {format(verifiedOn, "d MMMM yyyy 'at' HH:mm")}
          </p>
        </div>
        <div className='rounded-lg bg-blue-50 border border-blue-200 px-4 py-3'>
          <p className='text-sm font-semibold text-blue-800'>
            Next verification due
          </p>
          <p className='text-xs text-blue-600 mt-0.5'>
            From {format(nextDue, "d MMMM yyyy")} — you do not need to verify
            again before then.
          </p>
        </div>
        <Button variant='outline' asChild className='w-full'>
          <Link href='/dashboard/portal'>Back to Portal</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
