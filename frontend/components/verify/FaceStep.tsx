"use client";

import { useRef, useEffect, useState } from "react";
import {
  Camera,
  Play,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFaceApi } from "@/lib/useFaceApi";
import type { StepStatus } from "./types";

const FRAME_COUNT = 22;
const FRAME_MS = 300; // one frame every 300 ms → ~7 seconds total

interface FaceStepProps {
  status: StepStatus;
  frameCount: number;
  challenge: string;
  resultLabel?: string;
  /**
   * Called once all FRAME_COUNT frames are captured and analysed.
   * Passes the computed liveness stats AND the face descriptor (Float32Array
   * serialised as a regular number[]) so the parent can send them to the API.
   */
  onAnalysisComplete: (payload: {
    faceDetectedCount: number;
    eyeDetectedCount: number;
    motionScore: number;
    totalFrames: number;
    /** 128 floats → stored as number[] for JSON serialisation */
    descriptor: number[] | null;
  }) => void;
  onRetry: () => void;
  onNext: () => void;
}

export function FaceStep({
  status,
  frameCount,
  challenge,
  resultLabel,
  onAnalysisComplete,
  onRetry,
  onNext,
}: FaceStepProps) {
  const { state: faState, detectFace } = useFaceApi();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Local camera-ready flag
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Camera ────────────────────────────────────────────────────────
  async function openCamera() {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraOn(true);
      }
    } catch {
      setCamError(
        "Camera access denied — please allow camera permissions and try again.",
      );
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  // ── Capture + analyse ─────────────────────────────────────────────
  async function startCapture() {
    if (!cameraOn) await openCamera();
    if (faState !== "ready") return; // models not loaded yet

    let faceDetectedCount = 0;
    let eyeDetectedCount = 0;
    let motionScore = 0;
    let lastGrayData: Uint8ClampedArray | null = null;
    let capturedFrames = 0;
    let lastDescriptor: Float32Array | null = null;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const iv = setInterval(async () => {
      const v = videoRef.current;
      if (!v || v.videoWidth === 0) return;

      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      ctx.drawImage(v, 0, 0);

      capturedFrames++;

      // ── Liveness: motion between frames ────────────────────────────
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const gray = toGrayscale(imgData.data, canvas.width, canvas.height);

      if (lastGrayData) {
        let diff = 0;
        for (let i = 0; i < gray.length; i++)
          diff += Math.abs(gray[i] - lastGrayData[i]);
        motionScore += diff / gray.length; // mean pixel change
      }
      lastGrayData = gray;

      // ── face-api.js detection ──────────────────────────────────────
      const result = await detectFace(canvas);
      console.log("FACE RESULT:", result);
      if (result.faceFound) faceDetectedCount++;
      // if (result.bothEyesFound) eyeDetectedCount++;
      if (result.descriptor) lastDescriptor = result.descriptor;

      if (capturedFrames >= FRAME_COUNT) {
        clearInterval(iv);
        closeCamera();

        // Average motion over all intervals (FRAME_COUNT - 1 diffs)
        const avgMotion = motionScore / Math.max(capturedFrames - 1, 1);

        onAnalysisComplete({
          faceDetectedCount,
          eyeDetectedCount,
          motionScore: Math.round(avgMotion * 10) / 10,
          totalFrames: FRAME_COUNT,
          descriptor: lastDescriptor ? Array.from(lastDescriptor) : null,
        });
      }
    }, FRAME_MS);
  }

  const isDone = status === "done" || status === "failed";
  const isCapturing = status === "capturing";
  const isProcessing = status === "processing";
  const modelsReady = faState === "ready";

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Camera className='h-4 w-4' />
          Step 1 — Face Liveness + Recognition
          <span className='text-[10px] font-normal text-muted-foreground ml-auto'>
            face-api.js · browser-side
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className='px-4 pb-4 space-y-4'>
        {/* Model loading status */}
        {faState !== "ready" && (
          <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2'>
            {faState === "loading" || faState === "idle" ? (
              <>
                <Loader2 className='h-3 w-3 animate-spin' /> Loading face
                detection models…
              </>
            ) : (
              <>
                <XCircle className='h-3 w-3 text-destructive' /> Failed to load
                models — check your connection.
              </>
            )}
          </div>
        )}

        {/* Camera viewport */}
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden rounded-xl",
            "border-2 border-dashed border-border bg-muted",
            cameraOn && "border-primary border-solid",
          )}>
          <video
            ref={videoRef}
            className='w-full h-full object-cover'
            muted
            playsInline
          />
          <canvas ref={canvasRef} className='hidden' />

          {/* Idle placeholder */}
          {status === "idle" && !cameraOn && (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
              <Camera className='h-12 w-12 text-muted-foreground/40' />
              <p className='text-sm text-muted-foreground'>
                Camera not started
              </p>
              {camError && (
                <p className='text-xs text-destructive max-w-[260px] text-center'>
                  {camError}
                </p>
              )}
            </div>
          )}

          {/* Capturing overlay */}
          {isCapturing && (
            <div className='absolute inset-0 pointer-events-none flex flex-col justify-between p-3'>
              <div className='self-end bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-md'>
                {frameCount}/{FRAME_COUNT} frames
              </div>
              <div>
                <p className='text-center text-white text-sm font-medium mb-2 drop-shadow'>
                  👁 Please:{" "}
                  <span className='text-yellow-300'>{challenge}</span>
                </p>
                <Progress
                  value={(frameCount / FRAME_COUNT) * 100}
                  className='h-1.5'
                />
              </div>
            </div>
          )}

          {/* Processing overlay */}
          {isProcessing && (
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
              <p className='text-white text-sm flex items-center gap-2'>
                <Loader2 className='h-5 w-5 animate-spin' />
                Analysing liveness…
              </p>
            </div>
          )}

          {/* Done / failed overlay */}
          {isDone && (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                status === "done" ? "bg-emerald-500/20" : "bg-red-500/20",
              )}>
              {status === "done" ? (
                <CheckCircle2 className='h-16 w-16 text-emerald-500' />
              ) : (
                <XCircle className='h-16 w-16 text-red-500' />
              )}
              {resultLabel && (
                <p className='mt-2 text-sm font-semibold bg-white/80 px-3 py-1 rounded-full'>
                  {resultLabel}
                </p>
              )}
            </div>
          )}
        </div>

        {/* What happens info */}
        {status === "idle" && (
          <p className='text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed'>
            The camera captures {FRAME_COUNT} frames over ~7 seconds.
            face-api.js runs entirely in your browser — no video is sent to the
            server. Only detection scores are transmitted.
          </p>
        )}

        {/* Controls */}
        <div className='flex gap-2'>
          {status === "idle" && (
            <Button
              className='flex-1'
              onClick={startCapture}
              disabled={!modelsReady}>
              {!modelsReady ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Loading models…
                </>
              ) : (
                <>
                  <Play className='h-4 w-4 mr-2' />
                  Start Liveness Capture
                </>
              )}
            </Button>
          )}

          {isDone && (
            <>
              <Button
                variant='outline'
                onClick={() => {
                  closeCamera();
                  onRetry();
                }}>
                <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                Retry
              </Button>
              <Button className='flex-1' onClick={onNext}>
                Next: Fingerprint →
              </Button>
            </>
          )}

          {(isCapturing || isProcessing) && (
            <Button disabled className='flex-1'>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {isCapturing ? "Capturing frames…" : "Processing…"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Utility: convert RGBA pixel data to grayscale ──────────────────
function toGrayscale(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
  }
  return gray;
}
