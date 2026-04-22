"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/useConvexUser";
import { useVoiceEnrol } from "@/lib/useVoiceEnrol";
import { toast } from "sonner";
import { VoiceSearch } from "@/components/adminEnrollVoice/VoiceSearch";
import { VoiceRecord } from "@/components/adminEnrollVoice/VoiceRecorder";
import { getErrorMessage } from "@/lib/errors";
import { Id } from "@/convex/_generated/dataModel";

type StageType =
  | "search"
  | "ready"
  | "recording"
  | "processing"
  | "done"
  | "failed";

export default function EnrolVoicePage() {
  const { convexUserId } = useConvexUser();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<Id<"pensioners"> | null>(null);
  const [stage, setStage] = useState<StageType>("search");
  const [error, setError] = useState("");

  const pensioner = useQuery(
    api.pensioners.getById,
    selectedId ? { id: selectedId } : "skip",
  );
  const updateBiometric = useMutation(api.pensioners.updateBiometric);

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
          id: selectedId as Id<"pensioners">,
          voiceEncoding: JSON.stringify(data.embedding),
          biometricLevel: !!pensioner?.faceEncoding ? "L3" : "L1",
          updatedByUserId: convexUserId!,
        });

        toast.success(`Voice enrolled for ${pensioner?.fullName}`);
        setStage("done");
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

  function handleChange() {
    reset();
    setSelectedId(null);
    setStage("search");
    setError("");
  }

  function handleEnrolAnother() {
    reset();
    setSelectedId(null);
    setStage("search");
    setSearch("");
  }

  return (
    <div className='overflow-y-auto h-[calc(100dvh-64px)]'>
      <div className='bg-white border-b border-mist p-4'>
        <h2 className='text-lg font-bold'>🎙️ Voice Enrolment</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Record 3 voice samples to build a robust voiceprint
        </p>
      </div>

      <div className='max-w-2xl mx-auto p-4'>
        {!selectedId && (
          <VoiceSearch
            search={search}
            onSearchChange={setSearch}
            onSelect={(id) => {
              setSelectedId(id);
              setSearch("");
              setStage("ready");
            }}
          />
        )}

        {selectedId && pensioner && (
          <VoiceRecord
            selectedId={selectedId}
            pensionerName={pensioner.fullName}
            stage={stage}
            recording={recording}
            done={done}
            error={error}
            countdown={countdown}
            currentTake={currentTake}
            takesRequired={takesRequired}
            takes={takes}
            onRecord={recordTake}
            onRetry={handleRetry}
            onChange={handleChange}
            onEnrolAnother={handleEnrolAnother}
          />
        )}
      </div>
    </div>
  );
}
