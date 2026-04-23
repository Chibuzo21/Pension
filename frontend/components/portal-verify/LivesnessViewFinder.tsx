import { cn } from "@/lib/utils";
import { Camera, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { LIVENESS_FRAME_COUNT } from "@/lib/biometric-utils";
import type { StepStatus } from "@/lib/biometric-utils";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  faceStatus: StepStatus;
  livenessProgress: number;
  resultLabel?: string;
}

export function LivenessViewFinder({
  videoRef,
  canvasRef,
  faceStatus,
  livenessProgress,
  resultLabel,
}: Props) {
  return (
    <div
      className={cn(
        "relative w-full aspect-video bg-linear-to-br from-slate-900 to-slate-700 rounded-lg overflow-hidden border",
        faceStatus === "done" && "border-emerald-500",
        faceStatus === "failed" && "border-red-500",
      )}>
      <video
        ref={videoRef}
        className='w-full h-full object-cover'
        muted
        playsInline
      />
      <canvas ref={canvasRef} className='hidden' />

      {faceStatus === "idle" && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
          <Camera className='h-12 w-12 text-white/30' />
          <p className='text-sm text-white/50'>Camera not started</p>
        </div>
      )}

      {faceStatus === "capturing" && (
        <div className='absolute bottom-3 inset-x-3 space-y-2'>
          <p className='text-white text-sm text-center font-medium drop-shadow'>
            Slowly turn your head left and right while we capture
          </p>
          <div className='flex gap-1'>
            {Array.from({ length: LIVENESS_FRAME_COUNT }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-200",
                  i < livenessProgress ? "bg-emerald-400" : "bg-white/30",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {faceStatus === "processing" && (
        <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
          <div className='text-white text-sm flex items-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin' />
            Matching against reference…
          </div>
        </div>
      )}

      {(faceStatus === "done" || faceStatus === "failed") && (
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-center",
            faceStatus === "done" ? "bg-emerald-500/80" : "bg-red-500/80",
          )}>
          {faceStatus === "done" ? (
            <CheckCircle2 className='h-4 w-4 text-white mr-1.5' />
          ) : (
            <XCircle className='h-4 w-4 text-white mr-1.5' />
          )}
          <p className='text-white text-xs font-semibold'>{resultLabel}</p>
        </div>
      )}
    </div>
  );
}
