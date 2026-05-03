import { useAdminVerifySession } from "@/hooks/useAdminVerifySession";
import { StepTabBar } from "@/components/portal-verify/StepTabBar";
import { FaceStepCard } from "@/components/portal-verify/FaceStepCard";
import { VoiceStepCard } from "@/components/portal-verify/VoiceStepcard";
import { ResultCard } from "@/components/portal-verify/ResultCard";
import { ModalityStatusBar } from "@/components/portal-verify/ModalityStatusBar";
import { UserCheck, Loader2, Shield, AlertTriangle } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
export function AdminVerifyFlow({
  pensioner,
}: {
  pensioner: Doc<"pensioners">;
}) {
  const hasFace = !!pensioner.faceEncoding;
  const hasVoice = !!pensioner.voiceEncoding;

  const {
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
  } = useAdminVerifySession(pensioner);

  if (!hasFace) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center'>
        <AlertTriangle className='h-8 w-8 text-destructive' />
        <p className='font-semibold'>No face biometric enrolled</p>
        <p className='text-sm text-muted-foreground'>
          {pensioner.fullName} has not completed face enrollment. Ask them to
          enroll before attempting verification.
        </p>
      </div>
    );
  }

  // Guard: session expired
  if (expired && step !== "result") {
    return (
      <div className='flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800/40 dark:bg-amber-950/30'>
        <AlertTriangle className='h-8 w-8 text-amber-500' />
        <p className='font-semibold'>Session expired</p>
        <p className='text-sm text-muted-foreground'>
          The 15-minute window has elapsed. Please start a new session.
        </p>
        <Button variant='outline' onClick={resetSession}>
          Start new session
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Pensioner identity banner */}
      <div className='flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3'>
        <UserCheck className='h-5 w-5 shrink-0 text-primary' />
        <div className='min-w-0 flex-1 text-sm'>
          <span className='font-semibold'>{pensioner.fullName}</span>
          <span className='mx-2 text-muted-foreground'>·</span>
          <span className='text-muted-foreground'>{pensioner.pensionId}</span>
          <span className='mx-2 text-muted-foreground'>·</span>
          <span className='font-mono text-xs text-muted-foreground'>
            {pensioner.biometricLevel}
          </span>
        </div>
        <Badge
          variant='outline'
          className='shrink-0 border-border text-primary  '>
          Admin-assisted
        </Badge>
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
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Submitting…
            </>
          ) : (
            <>
              <Shield className='mr-2 h-4 w-4' />
              Submit Verification
            </>
          )}
        </Button>
      )}
    </div>
  );
}
