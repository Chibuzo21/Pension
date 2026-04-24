// ── RecentVerificationsList ────────────────────────────────────────
import { format } from "date-fns";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Verification {
  _id: string;
  status: string;
  verificationDate: string | number;
  assuranceLevel?: string;
  fusedScore?: number;
}

export function RecentVerificationsList({
  verifications,
  limit = 5,
}: {
  verifications: Verification[];
  limit?: number;
}) {
  if (!verifications.length) return null;

  return (
    <div className='bg-white border border-smoke rounded-xl overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-smoke flex items-center gap-2'>
        <div className='w-7 h-7 rounded-lg bg-g1/10 flex items-center justify-center'>
          <Shield className='h-3.5 w-3.5 text-g1' />
        </div>
        <span className='text-[12px] font-bold text-ink'>
          Recent Verifications
        </span>
        <span className='ml-auto text-[10px] px-2 py-0.5 bg-offwhite rounded-full text-slate font-medium'>
          {verifications.length} total
        </span>
      </div>

      <div className='divide-y divide-smoke'>
        {verifications.slice(0, limit).map((v) => {
          const verified = v.status === "VERIFIED";
          return (
            <div
              key={v._id}
              className='flex items-center gap-3 px-4 py-3 hover:bg-offwhite/60 transition-colors'>
              {/* Icon */}
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  verified ? "bg-emerald-50" : "bg-red-50",
                )}>
                {verified ? (
                  <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600' />
                ) : (
                  <XCircle className='h-3.5 w-3.5 text-red-500' />
                )}
              </div>

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    verified ? "text-emerald-700" : "text-red-600",
                  )}>
                  {verified ? "Verified" : "Failed"}
                  {v.assuranceLevel && (
                    <span className='ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-offwhite text-slate'>
                      {v.assuranceLevel}
                    </span>
                  )}
                </p>
                <p className='text-[10px] text-slate mt-0.5 font-mono'>
                  {format(new Date(v.verificationDate), "dd MMM yyyy · HH:mm")}
                </p>
              </div>

              {/* Score */}
              {v.fusedScore !== undefined && (
                <div
                  className={cn(
                    "text-[11px] font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-lg",
                    v.fusedScore >= 0.8
                      ? "bg-emerald-50 text-emerald-700"
                      : v.fusedScore >= 0.6
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-600",
                  )}>
                  {(v.fusedScore * 100).toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
