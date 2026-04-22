"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, biometricLevelBadge } from "@/lib/utils";
import {
  Shield,
  Camera,
  Mic,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { ScoreRow } from "./ScoreRow";

type LastVerification =
  | Pick<
      Doc<"verifications">,
      | "fusedScore"
      | "livenessScore"
      | "faceMatchScore"
      | "voiceScore"
      | "verificationDate"
    >
  | null
  | undefined;

export function BiometricStatusCard({
  pensioner,
  lastVerification,
}: {
  pensioner: Doc<"pensioners">;
  lastVerification?: LastVerification;
}) {
  // faceEncoding alone is sufficient — referencePhotoStorageId is optional

  const hasFace = !!pensioner.faceEncoding;
  const hasVoice = !!pensioner.voiceEncoding;

  const modalities = [
    {
      label: "Face + Liveness",
      icon: <Camera className='h-4 w-4' />,
      enrolled: hasFace,
      detail: hasFace
        ? "Face descriptor enrolled"
        : "Not enrolled — visit Face Enrol",
    },
    {
      label: "Voice",
      icon: <Mic className='h-4 w-4' />,
      enrolled: hasVoice,
      detail: hasVoice
        ? "Voiceprint enrolled"
        : "Not enrolled — visit Voice Enrol",
    },
  ];

  return (
    <Card className='border shadow-sm'>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Shield className='h-4 w-4 text-(--muted-foreground)' />
          Biometric Status
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 space-y-4'>
        {/* Level badge */}
        <div className='flex items-center justify-between p-3 rounded-lg bg-(--muted)/40 border'>
          <div>
            <p className='text-[10px] uppercase font-semibold tracking-wider text-(--muted-foreground)'>
              Assurance Level
            </p>
            <p className='text-2xl font-black text-(--foreground) mt-0.5'>
              {pensioner.biometricLevel}
            </p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border-2",
              biometricLevelBadge(pensioner.biometricLevel),
            )}>
            <Shield className='h-5 w-5' />
          </div>
        </div>

        {/* Modality checklist */}
        <div className='space-y-2.5'>
          {modalities.map((m) => (
            <div key={m.label} className='flex items-center gap-3'>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  m.enrolled
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-(--muted) text-(--muted-foreground)",
                )}>
                {m.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium truncate'>{m.label}</p>
                <p className='text-[10px] text-(--muted-foreground)'>
                  {m.detail}
                </p>
              </div>
              {m.enrolled ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
              ) : (
                <XCircle className='h-4 w-4 text-(--muted-foreground) shrink-0' />
              )}
            </div>
          ))}
        </div>

        {/* Last verification scores */}
        {lastVerification && (
          <div className='pt-2 border-t'>
            <p className='text-[10px] uppercase font-semibold tracking-wider text-(--muted-foreground) mb-2'>
              Last Verification
            </p>
            <div className='space-y-1.5'>
              {lastVerification.fusedScore !== undefined && (
                <ScoreRow
                  label='Fused Score'
                  score={lastVerification.fusedScore}
                  threshold={0.65}
                />
              )}
              {lastVerification.livenessScore !== undefined && (
                <ScoreRow
                  label='Liveness'
                  score={lastVerification.livenessScore}
                  threshold={0.6}
                />
              )}
              {lastVerification.faceMatchScore !== undefined && (
                <ScoreRow
                  label='Face Match'
                  score={lastVerification.faceMatchScore}
                  threshold={0.5}
                />
              )}
              {lastVerification.voiceScore !== undefined && (
                <ScoreRow
                  label='Voice'
                  score={lastVerification.voiceScore}
                  threshold={0.72}
                />
              )}
            </div>
          </div>
        )}

        {/* Enrol CTAs — only shown if not yet enrolled */}
        {(!hasFace || !hasVoice) && (
          <div className='flex gap-2 pt-1'>
            {!hasFace && (
              <Button
                size='sm'
                variant='outline'
                className='flex-1 text-xs'
                asChild>
                <Link href={`/dashboard/admin/enroll/face`}>
                  <Camera className='h-3 w-3 mr-1' />
                  Enrol Face
                </Link>
              </Button>
            )}
            {!hasVoice && (
              <Button
                size='sm'
                variant='outline'
                className='flex-1 text-xs'
                asChild>
                <Link href={`/dashboard/admin/enroll/voice`}>
                  <Mic className='h-3 w-3 mr-1' />
                  Enrol Voice
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
