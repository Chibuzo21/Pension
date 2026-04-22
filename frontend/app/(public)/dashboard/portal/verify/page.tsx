"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";

import { useVerifySession } from "@/hooks/useVerifySession";
import { VerifyGuardScreen } from "@/components/portal-verify/VerifyGuardScreen";
import { AlreadyVerifiedCard } from "@/components/portal-verify/AlreadyVerifiedCard";
import { StepTabBar } from "@/components/portal-verify/StepTabBar";
import { FaceStepCard } from "@/components/portal-verify/FaceStepCard";
import { VoiceStepCard } from "@/components/portal-verify/VoiceStepcard";
import { ResultCard } from "@/components/portal-verify/ResultCard";
import { ModalityStatusBar } from "@/components/portal-verify/ModalityStatusBar";

export default function PortalVerifyPage() {
  const {
    pensioner,
    isLoaded,
    expired,
    step,
    setStep,
    results,
    submitting,
    faceStatus,
    livenessProgress,
    videoRef,
    canvasRef,
    handleStartFace,
    runFaceVerify,
    handleRetryFace,
    voiceStatus,
    voiceCountdown,
    activePhrase,
    handleStartVoice,
    handleRetryVoice,
    submit,
    resetSession,
  } = useVerifySession();

  const thisMonthVerification = useQuery(
    api.verification.getThisMonthVerification,
    pensioner ? { pensionerId: pensioner._id } : "skip",
  );

  const hasFace = !!pensioner?.faceEncoding;
  const hasVoice = !!pensioner?.voiceEncoding;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className='max-w-xl mx-auto space-y-4 p-4'>
        <Skeleton className='h-14 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    );
  }

  // ── Guard states ──────────────────────────────────────────────────────────
  if (!pensioner) return <VerifyGuardScreen reason='not-linked' />;
  if (!hasFace) return <VerifyGuardScreen reason='no-face' />;
  if (expired && step !== "result")
    return <VerifyGuardScreen reason='expired' />;

  // ── Already verified this month ───────────────────────────────────────────
  const currentMonth = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  if (thisMonthVerification && step !== "result") {
    return (
      <div className='max-w-xl mx-auto space-y-5 p-4'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
            <Link href='/dashboard/portal'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h2 className='text-lg font-semibold'>Biometric Verification</h2>
        </div>
        <AlreadyVerifiedCard
          pensionerName={pensioner.fullName}
          currentMonth={currentMonth}
          verification={thisMonthVerification}
        />
      </div>
    );
  }

  // ── Main flow ─────────────────────────────────────────────────────────────
  return (
    <div className='max-w-2xl mx-auto space-y-5 p-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
          <Link href='/dashboard/portal'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h2 className='text-lg font-semibold'>Biometric Verification</h2>
          <p className='text-sm text-muted-foreground'>
            {pensioner.fullName} · {pensioner.pensionId} ·{" "}
            <span className='font-mono text-xs'>
              {pensioner.biometricLevel}
            </span>
          </p>
        </div>
      </div>

      <StepTabBar
        step={step}
        setStep={setStep}
        faceStatus={faceStatus}
        voiceStatus={voiceStatus}
        hasVoice={hasVoice}
      />

      {step === "face" && (
        <FaceStepCard
          faceStatus={faceStatus}
          livenessProgress={livenessProgress}
          results={results}
          hasVoice={hasVoice}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onStart={handleStartFace}
          onCapture={runFaceVerify}
          onRetry={handleRetryFace}
          onNext={() => (hasVoice ? setStep("voice") : submit())}
        />
      )}

      {step === "voice" && hasVoice && (
        <VoiceStepCard
          voiceStatus={voiceStatus}
          voiceCountdown={voiceCountdown}
          activePhrase={activePhrase}
          results={results}
          submitting={submitting}
          onStart={handleStartVoice}
          onRetry={handleRetryVoice}
          onSubmit={() => submit(results.face, results.voice)}
        />
      )}

      {step === "result" && results.overall && (
        <ResultCard
          results={results}
          pensionerName={pensioner.fullName}
          onNewSession={resetSession}
        />
      )}

      {step !== "result" && (
        <ModalityStatusBar
          faceStatus={faceStatus}
          voiceStatus={voiceStatus}
          hasVoice={hasVoice}
        />
      )}

      {/* Early submit — face only, no voice enrolled */}
      {faceStatus === "done" && !hasVoice && step !== "result" && (
        <Button
          className='w-full'
          size='lg'
          onClick={() => submit(results.face)}
          disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Submitting…
            </>
          ) : (
            <>
              <Shield className='h-4 w-4 mr-2' />
              Submit Verification
            </>
          )}
        </Button>
      )}
    </div>
  );
}
