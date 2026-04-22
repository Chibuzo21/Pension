import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VOICE_SECONDS } from "@/lib/biometric-utils";
import type {
  StepStatus,
  VerificationResults,
  Phrase,
} from "@/lib/biometric-utils";

interface Props {
  voiceStatus: StepStatus;
  voiceCountdown: number;
  activePhrase: Phrase | null;
  results: VerificationResults;
  submitting: boolean;
  onStart: () => void;
  onRetry: () => void;
  onSubmit: () => void;
}

export function VoiceStepCard({
  voiceStatus,
  voiceCountdown,
  activePhrase,
  results,
  submitting,
  onStart,
  onRetry,
  onSubmit,
}: Props) {
  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Mic className='h-4 w-4' />
          Voice Verification
          <span className='text-[10px] font-normal text-muted-foreground ml-auto'>
            ECAPA-TDNN + Whisper liveness
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 space-y-4'>
        {/* Phrase display */}
        <div className='bg-muted/40 rounded-xl p-5 border-2 border-dashed text-center'>
          {activePhrase ? (
            <>
              <p className='text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide'>
                Read this sentence clearly:
              </p>
              <p className='text-2xl font-bold text-foreground leading-snug px-2'>
                "{activePhrase.text}"
              </p>
              <p className='text-xs text-muted-foreground mt-3'>
                Speak slowly — take your time
              </p>
            </>
          ) : (
            <div className='flex items-center justify-center gap-2 text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='text-sm'>Loading phrase…</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className='flex flex-col items-center gap-3'>
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
              voiceStatus === "idle" && "bg-muted text-muted-foreground",
              voiceStatus === "capturing" &&
                "bg-red-50 text-red-500 animate-pulse ring-4 ring-red-100",
              voiceStatus === "processing" && "bg-blue-50 text-blue-500",
              voiceStatus === "done" && "bg-emerald-50 text-emerald-500",
              voiceStatus === "failed" && "bg-red-50 text-red-500",
            )}>
            {voiceStatus === "processing" ? (
              <Loader2 className='h-8 w-8 animate-spin' />
            ) : voiceStatus === "done" ? (
              <CheckCircle2 className='h-8 w-8' />
            ) : voiceStatus === "failed" ? (
              <XCircle className='h-8 w-8' />
            ) : (
              <Mic className='h-8 w-8' />
            )}
          </div>
          <p className='text-sm text-muted-foreground text-center'>
            {voiceStatus === "idle" &&
              "Press Record and say the number clearly"}
            {voiceStatus === "capturing" &&
              `🔴 Recording… ${voiceCountdown}s say the number now!`}
            {voiceStatus === "processing" && "Analysing voice…"}
            {voiceStatus === "done" && results.voice?.label}
            {voiceStatus === "failed" &&
              (results.voice?.label ?? "Voice verification failed")}
          </p>
        </div>

        {/* Action buttons */}
        <div className='flex gap-2'>
          {voiceStatus === "idle" && (
            <Button
              className='flex-1'
              onClick={onStart}
              disabled={!activePhrase}>
              <Mic className='h-4 w-4 mr-2' />
              Record ({VOICE_SECONDS}s)
            </Button>
          )}

          {(voiceStatus === "capturing" || voiceStatus === "processing") && (
            <Button disabled className='flex-1'>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {voiceStatus === "capturing"
                ? `Recording… ${voiceCountdown}s`
                : "Analysing…"}
            </Button>
          )}

          {(voiceStatus === "done" || voiceStatus === "failed") && (
            <>
              <Button variant='outline' onClick={onRetry}>
                <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                Retry
              </Button>
              <Button
                className='flex-1'
                onClick={onSubmit}
                disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Shield className='h-4 w-4 mr-2' />
                    Submit
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
