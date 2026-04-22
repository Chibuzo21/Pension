import { useRef, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  LIVENESS_FRAME_COUNT,
  LIVENESS_FRAME_MS,
  type StepStatus,
} from "@/lib/biometric-utils";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [faceStatus, setFaceStatus] = useState<StepStatus>("idle");
  const [livenessProgress, setLivenessProgress] = useState(0);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
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
      setFaceStatus("capturing");
    } catch {
      toast.error("Camera access denied — please allow camera permissions");
      setFaceStatus("failed");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  const captureLivenessFrames = useCallback(async (): Promise<string[]> => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    const frames: string[] = [];

    for (let i = 0; i < LIVENESS_FRAME_COUNT; i++) {
      await new Promise<void>((r) => setTimeout(r, LIVENESS_FRAME_MS));
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) continue;

      canvas.width = Math.max(video.videoWidth, 640);
      canvas.height = Math.max(video.videoHeight, 480);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const b64 = canvas
        .toDataURL("image/jpeg", 0.9)
        .replace(/^data:image\/\w+;base64,/, "");

      if (b64.length < 1000) continue;
      frames.push(b64);
      setLivenessProgress(i + 1);
    }

    return frames;
  }, []);

  return {
    videoRef,
    canvasRef,
    faceStatus,
    setFaceStatus,
    livenessProgress,
    setLivenessProgress,
    openCamera,
    closeCamera,
    captureLivenessFrames,
  };
}
