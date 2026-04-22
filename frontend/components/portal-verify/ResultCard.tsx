import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Camera, Mic, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FUSED_THRESHOLD } from "@/lib/biometric-utils";
import type { VerificationResults } from "@/lib/biometric-utils";
import ScoreCard from "./ScoreCard";

interface Props {
  results: VerificationResults;
  pensionerName: string;
  onNewSession: () => void;
}

export function ResultCard({ results, pensionerName, onNewSession }: Props) {
  const verified = results.overall === "VERIFIED";
  const modalityCount = [results.face, results.voice].filter(Boolean).length;

  return (
    <Card
      className={cn(
        "border-2",
        verified ? "border-emerald-500" : "border-red-400",
      )}>
      <CardContent className='px-6 py-8 text-center space-y-6'>
        {verified ? (
          <CheckCircle2 className='h-20 w-20 text-emerald-500 mx-auto' />
        ) : (
          <XCircle className='h-20 w-20 text-red-500 mx-auto' />
        )}

        <div>
          <p className='text-2xl font-black'>
            {verified ? "Verification Successful ✓" : "Verification Failed ✗"}
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            {pensionerName} · Assurance Level {results.level}
          </p>
        </div>

        <div
          className={cn(
            "grid gap-3",
            modalityCount === 2 ? "grid-cols-2" : "grid-cols-1",
          )}>
          {results.face && (
            <ScoreCard
              icon={<Camera className='h-4 w-4' />}
              label='Face'
              score={results.face.score}
              passed={results.face.passed}
              weight='60%'
            />
          )}
          {results.voice && (
            <ScoreCard
              icon={<Mic className='h-4 w-4' />}
              label='Voice'
              score={results.voice.score}
              passed={results.voice.passed}
              weight='40%'
            />
          )}
        </div>

        <div className='bg-muted/40 rounded-xl p-4'>
          <p className='text-xs text-muted-foreground mb-1'>
            Fused Biometric Score
          </p>
          <p className='text-4xl font-black tabular-nums'>
            {((results.fused ?? 0) * 100).toFixed(1)}%
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Threshold: {(FUSED_THRESHOLD * 100).toFixed(0)}% · Level:{" "}
            <span className='font-bold'>{results.level}</span>
          </p>
        </div>

        {!verified && (
          <div className='bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-left space-y-1'>
            <p className='text-xs font-semibold text-red-700'>
              Why did this fail?
            </p>
            {results.face && !results.face.passed && (
              <p className='text-xs text-red-600'>
                • Face check did not pass individually
              </p>
            )}
            {results.voice && !results.voice.passed && (
              <p className='text-xs text-red-600'>
                • Voice check did not pass individually
              </p>
            )}
            {results.face?.passed &&
              (!results.voice || results.voice.passed) &&
              (results.fused ?? 0) < FUSED_THRESHOLD && (
                <p className='text-xs text-red-600'>
                  • Fused score ({((results.fused ?? 0) * 100).toFixed(1)}%) is
                  below the {(FUSED_THRESHOLD * 100).toFixed(0)}% threshold
                </p>
              )}
          </div>
        )}

        <div className='flex gap-2'>
          <Button variant='outline' asChild className='flex-1'>
            <Link href='/dashboard/portal'>Back to Portal</Link>
          </Button>
          <Button className='flex-1' onClick={onNewSession}>
            New Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
