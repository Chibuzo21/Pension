"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/useConvexUser";
import { useVoiceEnrol } from "@/lib/useVoiceEnrol";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { Id } from "@/convex/_generated/dataModel";

const PASSPHRASE =
  "My name is [First Name] and I am verifying my pension today.";

interface Props {
  pensionerId: string;
  pensioner: {
    fullName: string;
    pensionId: string;
    faceEncoding?: string | null;
  };
  onDone?: () => void;
}

type Stage = "ready" | "recording" | "processing" | "done" | "failed";

export default function VoiceEnrolWidget({
  pensionerId,
  pensioner,
  onDone,
}: Props) {
  const { convexUserId } = useConvexUser();
  const updateBiometric = useMutation(api.pensioners.updateBiometric);

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState("");

  const {
    recordTake,
    reset,
    takes,
    recording,
    countdown,
    currentTake,
    takesRequired,
    done,
  } = useVoiceEnrol({
    onComplete: async (audioList) => {
      setStage("processing");
      try {
        const apiRes = await fetch("/api/verify/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioList, mode: "enrol" }),
        });
        const data = await apiRes.json();
        if (!apiRes.ok || !data.embedding) {
          throw new Error(data.error ?? "Enrolment failed");
        }

        await updateBiometric({
          id: pensionerId as Id<"pensioners">,
          voiceEncoding: JSON.stringify(data.embedding),
          biometricLevel: !!pensioner.faceEncoding ? "L3" : "L1",
          updatedByUserId: convexUserId!,
        });

        toast.success(`Voice enrolled for ${pensioner.fullName}`);
        setStage("done");
        onDone?.();
      } catch (e) {
        setError(getErrorMessage(e, "Processing failed"));
        setStage("failed");
      }
    },
    onError: (msg) => {
      setError(msg);
      setStage("failed");
    },
  });

  function handleRetry() {
    reset();
    setStage("ready");
    setError("");
  }

  return (
    <div className='card'>
      <div className='ch'>
        <div className='ct'>🎙️ Record Voiceprint</div>
      </div>
      <div className='cb'>
        {/* Passphrase */}
        <p className='mb-2 text-mist-950 text-[11px]'>
          Ask the pensioner to say clearly:
        </p>
        <div className='bg-smoke text-ink text-center font-mono text-[13px] py-3 px-4 rounded-md mb-5 italic'>
          "{PASSPHRASE}"
        </div>

        {/* Take progress pills */}
        <div className='flex gap-2 mb-5'>
          {Array.from({ length: takesRequired }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < takes.length
                  ? "bg-green-500"
                  : i === takes.length && recording
                    ? "bg-red-400 animate-pulse"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className='text-[11px] text-muted-foreground text-center mb-4'>
          {takes.length < takesRequired
            ? `Take ${currentTake} of ${takesRequired}`
            : "All takes recorded"}
        </p>

        {/* Ready / failed */}
        {(stage === "ready" || stage === "failed") && !done && (
          <>
            <div className='voice-box mb-4'>
              <span className='mic-icon'>🎙️</span>
              {stage === "failed" && (
                <p
                  style={{
                    fontWeight: 700,
                    color: "var(--red)",
                    marginBottom: 8,
                  }}>
                  {error}
                </p>
              )}
              <p className='text-[12px] text-muted-foreground'>
                {takes.length === 0
                  ? "Click Record for Take 1. The pensioner speaks the passphrase each time."
                  : `${takes.length} take${takes.length > 1 ? "s" : ""} done — click Record for Take ${currentTake}.`}
              </p>
            </div>
            <button
              className='btn-p w-full'
              onClick={recordTake}
              disabled={recording}>
              🔴 Record Take {currentTake} (6s)
            </button>
            {takes.length > 0 && (
              <button
                className='btn-sm boutline w-full mt-2'
                onClick={handleRetry}>
                ↺ Start Over
              </button>
            )}
          </>
        )}

        {/* Recording */}
        {recording && (
          <div className='voice-box rec'>
            <span className='mic-icon'>🔴</span>
            <div className='waveform active'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='wbar' />
              ))}
            </div>
            <div className='vtimer'>{countdown}</div>
            <p className='text-[12px] text-red mt-2'>
              Recording Take {currentTake}… ask pensioner to speak now
            </p>
          </div>
        )}

        {/* Processing */}
        {stage === "processing" && (
          <div className='voice-box mb-4'>
            <span className='mic-icon'>⏳</span>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              Building voiceprint from {takesRequired} samples…
            </p>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>
              Averaging embeddings for best accuracy
            </p>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className='voice-box ok'>
            <span className='mic-icon'>✅</span>
            <p className='text-g1 font-semibold mb-2 text-[14px]'>
              Voice Enrolled!
            </p>
            <p className='text-muted text-[11px]'>
              {pensioner.fullName}'s voiceprint ({takesRequired} samples
              averaged) has been stored for future verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
