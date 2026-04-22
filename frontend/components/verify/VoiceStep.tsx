"use client";

import {
  Mic,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StepStatus } from "./types";

const PASSPHRASE =
  "My name is [First Name] and I am verifying my pension today.";

interface VoiceStepProps {
  status: StepStatus;
  resultLabel?: string;
  /** Countdown seconds remaining — shown while recording */
  countdown?: number;
  onRecord: () => void;
  onRetry: () => void;
  onSubmit: () => void;
}

const MIC_STYLES: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  capturing: "bg-red-50 text-red-500",
  processing: "bg-blue-50 text-blue-500",
  done: "bg-emerald-50 text-emerald-500",
  failed: "bg-red-50 text-red-500",
};

const STATUS_TEXT: Record<string, string> = {
  idle: "Press record and speak the passphrase clearly",
  processing: "Analysing voice features…",
  failed: "Voice verification failed — please retry",
};

export function VoiceStep({
  status,
  resultLabel,
  countdown,
  onRecord,
  onRetry,
  onSubmit,
}: VoiceStepProps) {
  const isDone = status === "done" || status === "failed";
  const isRecord = status === "capturing";

  const bodyText =
    status === "done"
      ? resultLabel
      : isRecord
        ? undefined // replaced by countdown display below
        : (STATUS_TEXT[status] ?? STATUS_TEXT.idle);

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Mic className='h-4 w-4' />
          Step 3 — Voice Biometric
          <span className='text-[10px] font-normal text-muted-foreground ml-auto'>
            Web Audio API · browser-side
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className='px-4 pb-4 space-y-4'>
        {/* How it works */}
        {status === "idle" && (
          <div className='flex items-start gap-2.5 bg-muted/40 rounded-lg px-3 py-2.5'>
            <Info className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
            <p className='text-xs text-muted-foreground leading-relaxed'>
              The browser records 5 seconds of audio and extracts 20
              frequency-band energy values using the Web Audio API. Only those
              numbers — not the audio itself — are sent to the server for
              comparison.
            </p>
          </div>
        )}

        {/* Passphrase card */}
        <div className='bg-muted/40 rounded-xl p-5 border-2 border-dashed'>
          <p className='text-xs text-muted-foreground mb-2 text-center font-semibold uppercase tracking-wide'>
            Say clearly:
          </p>
          <p className='text-sm font-medium text-center leading-relaxed bg-background rounded-lg px-4 py-3 border'>
            "{PASSPHRASE}"
          </p>
        </div>

        {/* Mic icon + status */}
        <div className='flex flex-col items-center gap-3'>
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
              MIC_STYLES[status] ?? MIC_STYLES.idle,
              isRecord && "ring-4 ring-red-200 animate-pulse",
            )}>
            {status === "processing" && (
              <Loader2 className='h-8 w-8 animate-spin' />
            )}
            {status === "done" && <CheckCircle2 className='h-8 w-8' />}
            {status === "failed" && <XCircle className='h-8 w-8' />}
            {(status === "idle" || isRecord) && <Mic className='h-8 w-8' />}
          </div>

          {/* Countdown during recording */}
          {isRecord && countdown !== undefined && (
            <div className='flex flex-col items-center gap-1'>
              <span className='text-3xl font-black tabular-nums text-red-500'>
                {countdown}
              </span>
              <p className='text-xs text-red-500 font-medium'>
                Recording… speak now
              </p>
            </div>
          )}

          {bodyText && (
            <p className='text-sm text-muted-foreground text-center max-w-[280px]'>
              {bodyText}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className='flex gap-2'>
          {status === "idle" && (
            <Button className='flex-1' onClick={onRecord}>
              <Mic className='h-4 w-4 mr-2' />
              Start Recording (5 sec)
            </Button>
          )}

          {isDone && (
            <>
              <Button variant='outline' onClick={onRetry}>
                <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                Retry
              </Button>
              <Button className='flex-1' onClick={onSubmit}>
                <Shield className='h-4 w-4 mr-2' />
                Submit Verification
              </Button>
            </>
          )}

          {(isRecord || status === "processing") && (
            <Button disabled className='flex-1'>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {isRecord ? "Recording…" : "Processing…"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
