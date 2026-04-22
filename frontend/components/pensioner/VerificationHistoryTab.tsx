"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, verificationStatusBadge } from "@/lib/utils";
import { format } from "date-fns";
import { Shield, Camera, Fingerprint, Mic } from "lucide-react";

interface Verification {
  _id: string;
  status: string;
  livenessScore?: number;
  faceMatchScore?: number;
  fingerprintScore?: number;
  voiceScore?: number;
  fusedScore?: number;
  assuranceLevel?: string;
  overrideReason?: string;
  verificationDate: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  VERIFIED: { label: "Verified", className: "badge-verified" },
  FAILED: { label: "Failed", className: "badge-failed" },
  PENDING: { label: "Pending", className: "badge-pending" },
  MANUAL_OVERRIDE: {
    label: "Manual Override",
    className: "badge-manual-override",
  },
};

export function VerificationHistoryTab({
  verifications,
}: {
  verifications: Verification[];
}) {
  if (verifications.length === 0) {
    return (
      <div className='text-center py-12 text-sm text-(--muted-foreground)'>
        No verification history yet.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {verifications.map((v) => {
        const config = statusConfig[v.status] ?? statusConfig.PENDING;
        return (
          <Card key={v._id} className='border shadow-sm'>
            <CardContent className='px-4 py-3'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        config.className,
                      )}>
                      {config.label}
                    </span>
                    {v.assuranceLevel && (
                      <span className='text-xs font-bold text-(--muted-foreground)'>
                        {v.assuranceLevel}
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-(--muted-foreground) mt-1'>
                    {format(
                      new Date(v.verificationDate),
                      "dd MMM yyyy · HH:mm",
                    )}
                  </p>
                  {v.overrideReason && (
                    <p className='text-xs text-purple-600 mt-1 italic'>
                      Override: {v.overrideReason}
                    </p>
                  )}
                </div>

                {/* Scores */}
                <div className='flex items-center gap-3 text-right shrink-0'>
                  {v.fusedScore !== undefined && (
                    <div>
                      <p className='text-[10px] text-(--muted-foreground)'>
                        Fused
                      </p>
                      <p className='text-sm font-bold tabular-nums'>
                        {(v.fusedScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Per-modality scores */}
              <div className='grid grid-cols-3 gap-2 mt-3'>
                {v.livenessScore !== undefined && (
                  <MiniScore
                    icon={<Camera className='h-3 w-3' />}
                    label='Liveness'
                    score={v.livenessScore}
                    threshold={0.6}
                  />
                )}
                {v.fingerprintScore !== undefined && (
                  <MiniScore
                    icon={<Fingerprint className='h-3 w-3' />}
                    label='Fingerprint'
                    score={v.fingerprintScore}
                    threshold={0.7}
                  />
                )}
                {v.voiceScore !== undefined && (
                  <MiniScore
                    icon={<Mic className='h-3 w-3' />}
                    label='Voice'
                    score={v.voiceScore}
                    threshold={0.65}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MiniScore({
  icon,
  label,
  score,
  threshold,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  threshold: number;
}) {
  const pass = score >= threshold;
  return (
    <div className='bg-(--muted)/40 rounded-lg p-2 text-center'>
      <div
        className={cn(
          "flex items-center justify-center gap-1 text-[10px] font-medium mb-1",
          pass ? "text-emerald-600" : "text-red-500",
        )}>
        {icon}
        {label}
      </div>
      <p className='text-sm font-bold tabular-nums'>
        {(score * 100).toFixed(0)}%
      </p>
    </div>
  );
}
