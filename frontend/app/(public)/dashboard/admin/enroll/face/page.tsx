"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import EnrollHeader from "@/components/adminEnrollFace/EnrollHeader";
import SearchBar from "@/components/adminEnrollFace/SearchBar";
import CameraCapture from "@/components/adminEnrollFace/CameraCapture";
import { CheckCircle2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type Stage = "search" | "camera" | "preview" | "saving" | "done";

export default function EnrolFacePage() {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<Id<"pensioners"> | null>(null);
  const [stage, setStage] = useState<Stage>("search");
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const pensioner = useQuery(
    api.pensioners.getById,
    selectedId ? { id: selectedId } : "skip",
  );

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Camera ────────────────────────────────────────────────────
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

  return (
    <div className='max-w-xl mx-auto space-y-5 px-4 pb-12'>
      {/* Header */}

      <EnrollHeader />

      {/* Step 1 — Search */}

      <SearchBar
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        openCamera={openCamera}
      />
      {/* Step 2 — Camera + capture */}

      <CameraCapture
        camera={{ stage, setSnapshot, setStage, videoRef, streamRef, snapshot }}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        pensioner={pensioner}
        openCamera={openCamera}
      />
      {/* Done */}
      {stage === "done" && pensioner && (
        <Card className='border-emerald-300'>
          <CardContent className='px-6 py-8 text-center space-y-4'>
            <CheckCircle2 className='h-16 w-16 text-emerald-500 mx-auto' />
            <div>
              <p className='text-lg font-bold text-emerald-700'>
                Face Enrolled
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                {pensioner.fullName} · {pensioner.pensionId}
              </p>
            </div>
            <p className='text-xs text-muted-foreground'>
              512-float ArcFace descriptor stored via InsightFace.
            </p>
            <div className='flex gap-2 justify-center flex-wrap'>
              <Button
                variant='outline'
                onClick={() => {
                  setSelectedId(null);
                  setStage("search");
                  setSnapshot(null);
                }}>
                Enrol Another
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/admin/pensioners/${selectedId}/verify`,
                  )
                }>
                Verify Now →
              </Button>
              <Button
                variant='ghost'
                onClick={() =>
                  router.push(`/dashboard/admin/pensioners/${selectedId}`)
                }>
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
