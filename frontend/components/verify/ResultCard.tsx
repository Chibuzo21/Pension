"use client";

import Link from "next/link";
import { Camera, Mic, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VerifyResults } from "./types";
import ScoreCard from "./ScoreCard";

interface ResultCardProps {
  pensionerId: string;
  fullName?: string;
  results: VerifyResults;
  onNewSession: () => void;
}

export function ResultCard({
  pensionerId,
  fullName,
  results,
  onNewSession,
}: ResultCardProps) {
  const { overall, fused, level, face, voice } = results;
  const verified = overall === "VERIFIED";

  const scoreCards = [
    face && {
      icon: <Camera className='h-4 w-4' />,
      label: "Face",
      result: face,
      weight: "60%",
    },
    voice && {
      icon: <Mic className='h-4 w-4' />,
      label: "Voice",
      result: voice,
      weight: "40%",
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    result: { score: number; passed: boolean };
    weight: string;
  }[];

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
            {verified ? "Verified ✓" : "Failed ✗"}
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            {fullName} · {level}
          </p>
        </div>

        <div
          className={cn(
            "grid gap-3",
            scoreCards.length === 2 ? "grid-cols-2" : "grid-cols-1",
          )}>
          {scoreCards.map(({ icon, label, result, weight }) => (
            <ScoreCard
              key={label}
              icon={icon}
              label={label}
              score={result.score}
              passed={result.passed}
              weight={weight}
            />
          ))}
        </div>

        <div className='bg-muted/40 rounded-xl p-4'>
          <p className='text-xs text-muted-foreground mb-1'>
            Fused Biometric Score
          </p>
          <p className='text-4xl font-black tabular-nums'>
            {((fused ?? 0) * 100).toFixed(1)}%
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Threshold: 65% · Level: <span className='font-bold'>{level}</span>
          </p>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' asChild className='flex-1'>
            <Link href={`/dashboard/portal`}>Back to Portal</Link>
          </Button>
          <Button className='flex-1' onClick={onNewSession}>
            New Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
