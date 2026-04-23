import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useConvexUser } from "@/lib/useConvexUser";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import {
  computeFusion,
  SESSION_MS,
  type Step,
  type ModalityResult,
  type VerificationResults,
} from "@/lib/biometric-utils";
import { useFaceVerify } from "./useFaceVerify";
import { useVoiceVerify } from "./useVoiceVerify";
import { getErrorMessage } from "@/lib/errors";

export function useVerifySession() {
  const { convexUserId } = useConvexUser();
  const { pensioner, isLoaded } = useCurrentPensioner();
  const recordVerification = useMutation(api.verification.recordVerification);

  const [sessionStart] = useState(Date.now());
  const [step, setStep] = useState<Step>("face");
  const [submitting, setSubmitting] = useState(false);

  // Shared results — ref for async callbacks, state for renders
  const resultsRef = useRef<VerificationResults>({});
  const [results, setResults] = useState<VerificationResults>({});

  function updateResults(patch: Partial<VerificationResults>) {
    resultsRef.current = { ...resultsRef.current, ...patch };
    setResults({ ...resultsRef.current });
  }

  const face = useFaceVerify({
    pensionerFaceEncoding: pensioner?.faceEncoding ?? undefined,
    onResult: (result) => updateResults({ face: result }),
  });

  const voice = useVoiceVerify({
    active: step === "voice",
    pensionerVoiceEncoding: pensioner?.voiceEncoding ?? undefined,
    onResult: (result) => updateResults({ voice: result }),
  });

  const expired = Date.now() - sessionStart > SESSION_MS;

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submit(
    overrideFace?: ModalityResult,
    overrideVoice?: ModalityResult,
  ) {
    if (!convexUserId || !pensioner) return;
    setSubmitting(true);
    try {
      const faceResult = overrideFace ?? resultsRef.current.face;
      const voiceResult = overrideVoice ?? resultsRef.current.voice;
      const { fused, level, overall } = computeFusion(faceResult, voiceResult);
      updateResults({ fused, level, overall });

      await recordVerification({
        pensionerId: pensioner._id,
        fullName: pensioner.fullName,
        officerId: convexUserId,
        status: overall,
        livenessScore: faceResult?.score,
        faceMatchScore: faceResult?.score,
        voiceScore: voiceResult?.score,
        fusedScore: fused,
        assuranceLevel: level,
      });
      setStep("result");
    } catch (err) {
      toast.error(getErrorMessage(err, "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetSession() {
    setStep("face");
    face.handleRetryFace();
    voice.handleRetryVoice();
    resultsRef.current = {};
    setResults({});
  }

  return {
    pensioner,
    isLoaded,
    expired,
    step,
    setStep,
    results,
    submitting,
    submit,
    resetSession,
    ...face,
    ...voice,
  };
}
