"use client";

import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useConvexUser } from "@/lib/useConvexUser";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CameraControls from "./CameraControls";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";

type Stage = "search" | "camera" | "preview" | "saving" | "done";

type CameraProps = {
  stage: Stage;
  setStage: React.Dispatch<React.SetStateAction<Stage>>;
  snapshot: string | null;
  setSnapshot: React.Dispatch<React.SetStateAction<string | null>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.RefObject<MediaStream | null>;
};

export default function CameraCapture({
  camera,
  selectedId,
  pensioner,
  openCamera,
  setSelectedId,
}: {
  camera: CameraProps;
  selectedId: Id<"pensioners"> | null;
  pensioner: Doc<"pensioners"> | null | undefined;
  openCamera: () => Promise<void>;
  setSelectedId: React.Dispatch<React.SetStateAction<Id<"pensioners"> | null>>;
}) {
  const { stage, setStage, snapshot, setSnapshot, videoRef, streamRef } =
    camera;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saving, setSaving] = useState(false);

  const updateBiometric = useMutation(api.pensioners.updateBiometric);
  const { convexUserId } = useConvexUser();

  // ── Camera helpers ─────────────────────────────
  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function captureSnapshot() {
    const v = videoRef.current;
    const canvas = canvasRef.current;

    if (!v || !canvas || v.videoWidth === 0) {
      toast.error("Camera not ready — please wait a moment");
      return;
    }

    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);

    const snap = canvas.toDataURL("image/jpeg", 0.92);
    setSnapshot(snap);
    closeCamera();
    setStage("preview");
  }

  async function saveEnrolment() {
    if (!selectedId || !convexUserId || !snapshot) return;

    setSaving(true);

    try {
      const cleanImage = snapshot.replace(/^data:image\/\w+;base64,/, "");

      const res = await fetch("/api/verify/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: cleanImage,
          mode: "enrol",
          imageList: [cleanImage],
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Face enrolment failed");
      if (!data.embedding) throw new Error("No embedding returned");

      let storageId: string | null = null;

      const uploadUrl = await fetch("/api/storage/upload-url")
        .then((r) => r.json().then((d) => d.url as string | null))
        .catch(() => null);

      if (uploadUrl) {
        const blob = await fetch(snapshot).then((r) => r.blob());

        const up = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });

        if (up.ok) {
          storageId = (await up.json()).storageId ?? null;
        }
      }

      await updateBiometric({
        id: selectedId,
        faceEncoding: JSON.stringify(data.embedding),
        referencePhotoStorageId: storageId ?? undefined,
        biometricLevel: !!pensioner?.voiceEncoding ? "L3" : "L2",
        updatedByUserId: convexUserId!,
      });

      setStage("done");
      toast.success(`Face enrolled for ${pensioner?.fullName}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Enrolment failed"));
    } finally {
      setSaving(false);
    }
  }

  function retake() {
    setSnapshot(null);
    openCamera();
  }

  // ── UI ─────────────────────────────
  if (!selectedId || !pensioner || stage === "done") return null;

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center justify-between'>
          <span className='flex items-center gap-2'>
            <Camera className='h-4 w-4' />
            Step 2 — Capture Reference Photo
          </span>

          <button
            className='text-xs text-muted-foreground hover:text-foreground'
            onClick={() => {
              closeCamera();
              setSelectedId(null);
              setSnapshot(null);
              setStage("search");
            }}>
            ← Change
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className='px-4 pb-4 space-y-4'>
        {/* Identity */}
        <div className='flex items-center gap-2.5 bg-muted/40 rounded-lg px-3 py-2'>
          <div className='w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold'>
            {pensioner.fullName
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <p className='text-sm font-medium'>{pensioner.fullName}</p>
            <p className='text-xs text-muted-foreground font-mono'>
              {pensioner.pensionId}
            </p>
          </div>

          <Badge variant='outline' className='ml-auto text-[10px]'>
            {pensioner.biometricLevel}
          </Badge>
        </div>

        {/* Camera / Preview */}
        {stage !== "preview" ? (
          <div
            className={cn(
              "relative aspect-video rounded-xl overflow-hidden border-2 border-dashed bg-muted",
              stage === "camera" && "border-primary border-solid",
            )}>
            <video
              ref={videoRef}
              className='w-full h-full object-cover'
              muted
              playsInline
            />

            <canvas ref={canvasRef} className='hidden' />

            {stage === "search" && (
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <Camera className='h-10 w-10 text-muted-foreground/40' />
                <p className='text-sm text-muted-foreground'>
                  Camera not started
                </p>
              </div>
            )}
          </div>
        ) : (
          <img
            src={snapshot!}
            className='w-full rounded-xl border-2 border-primary'
          />
        )}

        {/* Controls */}
        <CameraControls
          stage={stage}
          saving={saving}
          onCapture={captureSnapshot}
          onRetake={retake}
          onSave={saveEnrolment}
        />
      </CardContent>
    </Card>
  );
}
