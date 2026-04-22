"use client";

import { useState, useRef, useEffect } from "react";
import { useConvexUser } from "@/lib/useConvexUser";
import { useFaceApi } from "@/lib/useFaceApi";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

type Stage = "camera" | "capturing" | "preview" | "saving" | "done";

const FRAME_COUNT = 22;
const FRAME_MS = 300;

interface Props {
  pensionerId: string;
  pensioner: {
    fullName: string;
    pensionId: string;
    faceEncoding?: string | null;
  };
  onDone?: () => void;
}

export default function FaceEnrolWidget({
  pensionerId,
  pensioner,
  onDone,
}: Props) {
  const { convexUserId } = useConvexUser();
  const { state: faState, detectFace } = useFaceApi();

  const [stage, setStage] = useState<Stage>("camera");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    openCamera();
    return () => closeCamera();
  }, []);

  async function openCamera() {
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
      }
      setStage("camera");
    } catch {
      toast.error("Camera access denied — please allow camera permissions");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCapture() {
    if (faState !== "ready") {
      toast.error("Face models still loading — please wait");
      return;
    }
    setStage("capturing");
    setFrameCount(0);

    let bestDescriptor: Float32Array | null = null;
    let faceFrames = 0;
    let capturesDone = 0;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const iv = setInterval(async () => {
      const v = videoRef.current;
      if (!v || v.videoWidth === 0) return;

      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      ctx.drawImage(v, 0, 0);
      capturesDone++;
      setFrameCount(capturesDone);

      const result = await detectFace(canvas);
      if (result.faceFound) {
        faceFrames++;
        if (result.descriptor) bestDescriptor = result.descriptor;
      }

      if (capturesDone >= FRAME_COUNT) {
        clearInterval(iv);
        closeCamera();

        if (faceFrames < FRAME_COUNT * 0.5) {
          toast.error(
            `Face only detected in ${faceFrames}/${FRAME_COUNT} frames — please try again with better lighting`,
          );
          setStage("camera");
          openCamera();
          return;
        }

        const snap = canvas.toDataURL("image/jpeg", 0.92);
        setSnapshot(snap);
        setDescriptor(bestDescriptor ? Array.from(bestDescriptor) : null);
        setStage("preview");
      }
    }, FRAME_MS);
  }

  async function saveEnrolment() {
    if (!convexUserId) return;
    setSaving(true);

    try {
      let storageId: string | null = null;
      if (snapshot) {
        const uploadUrl = await fetch("/api/storage/upload-url", {
          method: "POST",
        })
          .then((r) => r.json().then((d) => d.url as string | null))
          .catch(() => null);

        if (uploadUrl) {
          const blob = await fetch(snapshot).then((r) => r.blob());
          const up = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: blob,
          });
          if (up.ok) storageId = (await up.json()).storageId ?? null;
        }
      }

      const res = await fetch("/api/verify/face/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pensionerId,
          encoding: descriptor ? JSON.stringify(descriptor) : null,
          referencePhotoStorageId: storageId,
          force: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Enrolment failed");
      }

      setStage("done");
      toast.success(`Face enrolled for ${pensioner.fullName}`);
      onDone?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Enrolment failed"));
      setSaving(false);
    }
  }

  function reset() {
    setSnapshot(null);
    setDescriptor(null);
    setFrameCount(0);
    openCamera();
  }

  const modelsReady = faState === "ready";

  return (
    <div className='card'>
      <div className='ch'>
        <div className='ct'>📷 Capture Reference Photo</div>
      </div>
      <div className='cb'>
        {/* Model loading banner */}
        {faState !== "ready" && (
          <div className='flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-4'>
            <Loader2 className='h-3 w-3 animate-spin shrink-0' />
            {faState === "error"
              ? "Failed to load face models"
              : "Loading face detection models…"}
          </div>
        )}

        {/* Viewport — camera / capturing */}
        {(stage === "camera" || stage === "capturing") && (
          <div
            className={cn(
              "relative aspect-video rounded-xl overflow-hidden border-2 border-dashed bg-muted mb-4",
              "border-primary border-solid",
            )}>
            <video
              ref={videoRef}
              className='w-full h-full object-cover'
              muted
              playsInline
            />
            <canvas ref={canvasRef} className='hidden' />

            {stage === "capturing" && (
              <div className='absolute inset-0 pointer-events-none flex flex-col justify-between p-3'>
                <div className='self-end bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-md'>
                  {frameCount}/{FRAME_COUNT}
                </div>
                <div>
                  <p className='text-white text-sm text-center font-medium mb-2 drop-shadow'>
                    Look directly at the camera
                  </p>
                  <Progress
                    value={(frameCount / FRAME_COUNT) * 100}
                    className='h-1.5'
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview snapshot */}
        {stage === "preview" && (
          <div className='mb-4 space-y-3'>
            <img
              src={snapshot!}
              alt='Captured reference photo'
              className='w-full rounded-xl border-2 border-primary object-cover'
              style={{ maxHeight: 260 }}
            />
            <p className='text-[11px] text-muted-foreground text-center'>
              {descriptor
                ? "✓ Face descriptor extracted (128 floats). Review and confirm."
                : "⚠ No face descriptor — poor lighting or face not visible. Please retake."}
            </p>
          </div>
        )}

        {/* Done state */}
        {stage === "done" && (
          <div className='voice-box ok mb-4'>
            <span className='mic-icon'>✅</span>
            <p className='text-g1 font-semibold mb-2 text-[14px]'>
              Face Enrolled!
            </p>
            <p className='text-muted text-[11px]'>
              {pensioner.fullName}'s face descriptor has been stored and will be
              used for future verification.
            </p>
          </div>
        )}

        {/* Controls */}
        {stage === "camera" && (
          <button
            className='btn-p w-full'
            onClick={startCapture}
            disabled={!modelsReady}>
            {!modelsReady ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                Loading models…
              </span>
            ) : (
              `▶ Capture (${FRAME_COUNT} frames)`
            )}
          </button>
        )}

        {stage === "capturing" && (
          <button className='btn-p w-full' disabled>
            <span className='flex items-center justify-center gap-2'>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              Analysing frame {frameCount}…
            </span>
          </button>
        )}

        {stage === "preview" && (
          <div className='flex gap-2'>
            <button className='btn-sm boutline' onClick={reset}>
              ↺ Retake
            </button>
            <button
              className='btn-p flex-1'
              onClick={saveEnrolment}
              disabled={saving || !descriptor}>
              {saving ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Saving…
                </span>
              ) : (
                "Confirm & Save Enrolment"
              )}
            </button>
          </div>
        )}

        {stage === "saving" && (
          <button className='btn-p w-full' disabled>
            <span className='flex items-center justify-center gap-2'>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              Saving…
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
