import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Play, RefreshCw, Loader2 } from "lucide-react";
import { LivenessViewFinder } from "./LivesnessViewFinder";
import { LIVENESS_FRAME_COUNT } from "@/lib/biometric-utils";
import type { StepStatus, VerificationResults } from "@/lib/biometric-utils";

interface Props {
  faceStatus: StepStatus;
  livenessProgress: number;
  results: VerificationResults;
  hasVoice: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStart: () => void;
  onCapture: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export function FaceStepCard({
  faceStatus,
  livenessProgress,
  results,
  hasVoice,
  videoRef,
  canvasRef,
  onStart,
  onCapture,
  onRetry,
  onNext,
}: Props) {
  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Camera className='h-4 w-4' />
          Face Identity Check
          <span className='text-[10px] font-normal text-muted-foreground ml-auto'>
            InsightFace · liveness {livenessProgress}/{LIVENESS_FRAME_COUNT}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 space-y-4'>
        <LivenessViewFinder
          videoRef={videoRef}
          canvasRef={canvasRef}
          faceStatus={faceStatus}
          livenessProgress={livenessProgress}
          resultLabel={results.face?.label}
        />

        <div className='flex gap-2'>
          {faceStatus === "idle" && (
            <Button className='flex-1' onClick={onStart}>
              <Play className='h-4 w-4 mr-2' />
              Start Camera
            </Button>
          )}

          {faceStatus === "capturing" && (
            <Button
              className='flex-1'
              onClick={onCapture}
              disabled={livenessProgress > 0}>
              {livenessProgress > 0 ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Capturing ({livenessProgress}/{LIVENESS_FRAME_COUNT})…
                </>
              ) : (
                <>
                  <Camera className='h-4 w-4 mr-2' />
                  Capture & Verify
                </>
              )}
            </Button>
          )}

          {faceStatus === "processing" && (
            <Button disabled className='flex-1'>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Matching…
            </Button>
          )}

          {(faceStatus === "done" || faceStatus === "failed") && (
            <>
              <Button variant='outline' onClick={onRetry}>
                <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                Retry
              </Button>
              <Button className='flex-1' onClick={onNext}>
                {hasVoice ? "Next: Voice →" : "Submit →"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
