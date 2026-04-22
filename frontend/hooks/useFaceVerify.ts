import { toast } from "sonner";
import { type StepStatus, type ModalityResult } from "@/lib/biometric-utils";
import { useCamera } from "./useCamera";
import { getErrorMessage } from "@/lib/errors";

type UseFaceVerifyOptions = {
  pensionerFaceEncoding: string | undefined;
  onResult: (result: ModalityResult) => void;
};

export function useFaceVerify({
  pensionerFaceEncoding,
  onResult,
}: UseFaceVerifyOptions) {
  const camera = useCamera();

  async function handleStartFace() {
    camera.setLivenessProgress(0);
    await camera.openCamera();
  }

  async function runFaceVerify() {
    camera.setFaceStatus("capturing");
    await new Promise<void>((r) => setTimeout(r, 800));
    toast.info("Slowly turn your head left and right while we capture");
    await new Promise<void>((r) => setTimeout(r, 1500)); // let user read it

    const frames = await camera.captureLivenessFrames();
    camera.closeCamera();

    if (frames.length < 5) {
      toast.error(
        "Not enough frames captured — please retry in better lighting",
      );
      camera.setFaceStatus("failed");
      return;
    }

    camera.setFaceStatus("processing");

    try {
      const referenceEmbedding = pensionerFaceEncoding
        ? JSON.parse(pensionerFaceEncoding)
        : null;

      if (!referenceEmbedding)
        throw new Error("No face reference — please visit admin to re-enrol");

      const res = await fetch("/api/verify/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, referenceEmbedding, mode: "verify" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Face check failed");
      if (res.status === 409) {
        throw new Error(
          data.error ?? "Face data outdated — re-enrolment required",
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Face check failed");

      if (data.reason === "no_face_detected")
        throw new Error("No face detected — please retry in better lighting");
      if (data.reason === "multiple_faces_detected")
        throw new Error(
          "Multiple faces detected — only you should be in frame",
        );
      if (data.reason === "spoof_detected_static_image")
        throw new Error(
          "Liveness check failed — please use a live camera, not a photo",
        );

      const result: ModalityResult = {
        score: data.score,
        passed: data.passed,
        label: `Match: ${(data.score * 100).toFixed(0)}% · Confidence: ${((data.detection_confidence ?? 0) * 100).toFixed(0)}%`,
      };

      camera.setFaceStatus(data.passed ? "done" : "failed");
      onResult(result);
    } catch (err) {
      toast.error(getErrorMessage(err, "Face analysis failed"));
      camera.setFaceStatus("failed");
      onResult({
        score: 0,
        passed: false,
        label: getErrorMessage(err, "Analysis failed"),
      });
    }
  }

  function handleRetryFace() {
    camera.setLivenessProgress(0);
    camera.setFaceStatus("idle");
  }

  return {
    // re-export camera refs needed by UI
    videoRef: camera.videoRef,
    canvasRef: camera.canvasRef,
    faceStatus: camera.faceStatus,
    livenessProgress: camera.livenessProgress,
    handleStartFace,
    runFaceVerify,
    handleRetryFace,
  };
}
