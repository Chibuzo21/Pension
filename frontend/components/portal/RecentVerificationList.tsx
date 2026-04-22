import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, AlertTriangle, Shield } from "lucide-react";

interface Verification {
  _id: string;
  status: string;
  verificationDate: string | number;
  assuranceLevel?: string;
  fusedScore?: number;
}

interface Props {
  verifications: Verification[];
  /** Max rows to show (default 5) */
  limit?: number;
}

export function RecentVerificationsList({ verifications, limit = 5 }: Props) {
  if (!verifications.length) return null;

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Shield className='h-4 w-4 text-(--muted-foreground)' />
          Recent Verifications
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-3 space-y-2'>
        {verifications.slice(0, limit).map((v) => (
          <div key={v._id} className='flex items-center gap-3 py-1.5'>
            {v.status === "VERIFIED" ? (
              <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
            ) : (
              <AlertTriangle className='h-4 w-4 text-amber-500 shrink-0' />
            )}
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium'>{v.status}</p>
              <p className='text-[10px] text-(--muted-foreground)'>
                {format(new Date(v.verificationDate), "dd MMM yyyy · HH:mm")}
                {v.assuranceLevel && ` · ${v.assuranceLevel}`}
              </p>
            </div>
            {v.fusedScore !== undefined && (
              <span className='text-xs font-mono text-(--muted-foreground) shrink-0'>
                {(v.fusedScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
