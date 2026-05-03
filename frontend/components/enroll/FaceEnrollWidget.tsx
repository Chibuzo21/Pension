"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Play, RotateCcw, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Stage = "camera" | "capturing" | "preview" | "saving" | "done";

const FRAME_COUNT = 10; // how many frames to capture for enrolment
const FRAME_MS = 200; // ms between frames

interface Props {
  pensionerId: Id<"pensioners">;
  pensioner: Doc<"pensioners">;
  onDone?: () => void;
}

export default function FaceEnrolWidget({
  pensionerId,
  pensioner,
  onDone,
}: Props) {
  const [stage, setStage] = useState<Stage>("camera");
  const [frameCount, setFrameCount] = useState(0);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    startCamera();

    return () => {
      isMounted.current = false;
      closeCamera();
    };
  }, []);
  async function startCamera() {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!isMounted.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStage("capturing");
    setFrameCount(0);

    const capturedFrames: string[] = [];
    let lastSnap: string | null = null;
    let done = 0;

    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        const v = videoRef.current;
        if (!v || v.videoWidth === 0) return;

        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        canvas.getContext("2d")!.drawImage(v, 0, 0);

        const frame = canvas
          .toDataURL("image/jpeg", 0.85)
          .replace(/^data:image\/\w+;base64,/, "");

        capturedFrames.push(frame);
        lastSnap = canvas.toDataURL("image/jpeg", 0.92);
        done++;
        setFrameCount(done);

        if (done >= FRAME_COUNT) {
          clearInterval(iv);
          resolve();
        }
      }, FRAME_MS);
    });

    closeCamera();
    setFrames(capturedFrames);
    setSnapshot(lastSnap);
    setStage("preview");
  }

  async function saveEnrolment() {
    if (!frames.length || !snapshot) return;
    setSaving(true);

    try {
      // ── Step 1: get embedding from Python backend ──
      const enrolRes = await fetch("/api/verify/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "enrol",
          imageList: frames, // send all frames, backend averages them
        }),
      });

      const enrolData = await enrolRes.json();
      if (!enrolRes.ok)
        throw new Error(enrolData.error ?? "Face enrolment failed");
      if (!enrolData.embedding)
        throw new Error("No embedding returned from backend");

      // ── Step 2: upload reference photo to Convex storage ──
      let storageId: string | null = null;
      try {
        const uploadUrl = await fetch("/api/storage/upload-url", {
          method: "POST",
        })
          .then((r) => r.json())
          .then((d) => d.url as string | null);

        if (uploadUrl) {
          const blob = await fetch(snapshot).then((r) => r.blob());
          const up = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: blob,
          });
          if (up.ok) storageId = (await up.json()).storageId ?? null;
        }
      } catch {
        // Non-fatal — enrolment can proceed without the reference photo
      }

      const saveRes = await fetch("/api/verify/face/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pensionerId,
          encoding: JSON.stringify(enrolData.embedding),
          referencePhotoStorageId: storageId,
          force: true,
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error ?? "Failed to save enrolment");
      }

      setStage("done");
      toast.success(`Face enrolled for ${pensioner.fullName}`);
      onDone?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Enrolment failed"));
      setSaving(false);
    }
  }
  async function reset() {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSnapshot(null);
    setFrames([]);
    setFrameCount(0);
    setStage("camera"); // ← mount the video element first

    // Small tick to let React re-render and remount the video element
    await new Promise((r) => setTimeout(r, 50));
    await startCamera();
  }

  return (
    <div className='space-y-4'>
      {/* Viewport */}
      {(stage === "camera" || stage === "capturing") && (
        <div
          className={cn(
            "relative aspect-video rounded-xl overflow-hidden border-2 bg-muted",
            stage === "capturing"
              ? "border-primary border-solid"
              : "border-dashed",
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
                  Look naturally at the camera — blink or move slightly to
                  verify it's you
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

      {/* Preview */}
      {stage === "preview" && snapshot && (
        <div className='space-y-2'>
          <img
            src={snapshot}
            alt='Captured reference photo'
            className='w-full rounded-xl border-2 border-primary object-cover'
            style={{ maxHeight: 260 }}
          />
          <p className='text-[11px] text-muted-foreground text-center'>
            {frames.length} frames captured · review and confirm
          </p>
        </div>
      )}

      {/* Done */}
      {stage === "done" && (
        <div className='flex flex-col items-center gap-2 py-6 text-center'>
          <CheckCircle2 className='h-12 w-12 text-emerald-500' />
          <p className='font-semibold text-emerald-700'>Face Enrolled</p>
          <p className='text-xs text-muted-foreground'>
            {pensioner.fullName}'s face descriptor has been stored.
          </p>
        </div>
      )}

      {/* Controls */}
      {stage === "camera" && (
        <Button className='w-full' onClick={startCapture}>
          <Play className='h-4 w-4 mr-2' />
          Capture ({FRAME_COUNT} frames)
        </Button>
      )}

      {stage === "capturing" && (
        <Button className='w-full' disabled>
          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          Analysing frame {frameCount}…
        </Button>
      )}

      {stage === "preview" && (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              reset();
            }}
            disabled={saving}>
            <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
            Retake
          </Button>
          <Button className='flex-1' onClick={saveEnrolment} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Saving…
              </>
            ) : (
              "Confirm & Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
