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
        if (!apiRes.ok || !data.embedding)
          throw new Error(data.error ?? "Enrolment failed");

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

  const ninLength = takes.length;

  return (
    <div className='bg-white border border-mist rounded-[11px] shadow-[0_1px_5px_rgba(0,50,0,0.07)] overflow-hidden'>
      {/* Header */}
      <div className='bg-[g1 px-4 py-3 flex items-center gap-2'>
        <span className='text-white text-[13px] font-bold'>
          🎙️ Record Voiceprint
        </span>
      </div>

      {/* Body */}
      <div className='p-4 space-y-4'>
        <p className='text-[11px] text-slate'>
          Ask the pensioner to say clearly:
        </p>
        <div className='bg-smoke text-ink text-center font-mono text-[13px] py-3 px-4 rounded-lg italic'>
          "{PASSPHRASE}"
        </div>

        {/* Take progress */}
        <div className='flex gap-1.5'>
          {Array.from({ length: takesRequired }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-150 ${
                i < takes.length
                  ? "bg-g1"
                  : i === takes.length && recording
                    ? "bg-red animate-pulse"
                    : "bg-mist"
              }`}
            />
          ))}
        </div>
        <p className='text-[11px] text-slate text-center'>
          {takes.length < takesRequired
            ? `Take ${currentTake} of ${takesRequired}`
            : "All takes recorded"}
        </p>

        {/* Ready / failed */}
        {(stage === "ready" || stage === "failed") && !done && (
          <>
            <div className='border-2 border-dashed border-mist rounded-[9px] p-5 text-center'>
              <span className='text-[40px] block mb-2'>🎙️</span>
              {stage === "failed" && (
                <p className='text-red font-bold text-[12px] mb-3'>{error}</p>
              )}
              <p className='text-[12px] text-slate'>
                {takes.length === 0
                  ? "Click Record for Take 1. The pensioner speaks the passphrase each time."
                  : `${takes.length} take${takes.length > 1 ? "s" : ""} done — click Record for Take ${currentTake}.`}
              </p>
            </div>
            <button
              onClick={recordTake}
              disabled={recording}
              className='w-full bg-gold hover:bg-gold2 text-black font-bold text-[13px] py-2.5 rounded-lg transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed'>
              🔴 Record Take {currentTake} (6s)
            </button>
            {takes.length > 0 && (
              <button
                onClick={handleRetry}
                className='w-full mt-2 bg-transparent border border-mist text-slate hover:border-g1 hover:text-g1 text-[11px] font-semibold py-1.5 rounded-[7px] transition-all duration-150'>
                ↺ Start Over
              </button>
            )}
          </>
        )}

        {/* Recording */}
        {recording && (
          <div className='border-2 border-[var(--red)] bg-[#fff5f5] rounded-[9px] p-5 text-center'>
            <span className='text-[40px] block mb-2'>🔴</span>
            <div className='flex items-center justify-center gap-1.5 h-7 my-3'>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='w-1 rounded-full bg-[var(--red)] animate-[wave_0.8s_ease-in-out_infinite]'
                  style={{
                    animationDelay: `${[0, 0.1, 0.2, 0.15, 0.05][i]}s`,
                    height: 5,
                  }}
                />
              ))}
            </div>
            <div className='text-[var(--red)] font-black text-[28px] leading-none mb-2'>
              {countdown}
            </div>
            <p className='text-[12px] text-[var(--red)] font-medium'>
              Recording Take {currentTake}… ask pensioner to speak now
            </p>
          </div>
        )}

        {/* Processing */}
        {stage === "processing" && (
          <div className='border-2 border-dashed border-[var(--mist)] rounded-[9px] p-5 text-center'>
            <span className='text-[40px] block mb-2'>⏳</span>
            <p className='font-bold text-[14px] text-[var(--ink)] mb-1'>
              Building voiceprint from {takesRequired} samples…
            </p>
            <p className='text-[11px] text-[var(--slate)]'>
              Averaging embeddings for best accuracy
            </p>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className='border-2 border-[var(--g1)] bg-[#f0faf0] rounded-[9px] p-5 text-center'>
            <span className='text-[40px] block mb-2'>✅</span>
            <p className='text-[var(--g1)] font-semibold text-[14px] mb-1.5'>
              Voice Enrolled!
            </p>
            <p className='text-[11px] text-slate'>
              {pensioner.fullName}'s voiceprint ({takesRequired} samples
              averaged) has been stored for future verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
