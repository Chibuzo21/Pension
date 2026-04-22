"use client";

import { useRouter } from "next/navigation";
import { TakeProgress } from "./TakeProgress";
import { VoiceControls } from "./VoiceControl";

const PASSPHRASE =
  "My name is [First Name] and I am verifying my pension today.";

type StageType =
  | "search"
  | "ready"
  | "recording"
  | "processing"
  | "done"
  | "failed";

interface VoiceRecordProps {
  selectedId: string;
  pensionerName: string;
  stage: StageType;
  recording: boolean;
  done: boolean;
  error: string;
  countdown: number;
  currentTake: number;
  takesRequired: number;
  takes: unknown[];
  onRecord: () => void;
  onRetry: () => void;
  onChange: () => void;
  onEnrolAnother: () => void;
}

export function VoiceRecord({
  selectedId,
  pensionerName,
  stage,
  recording,
  done,
  error,
  countdown,
  currentTake,
  takesRequired,
  takes,
  onRecord,
  onRetry,
  onChange,
  onEnrolAnother,
}: VoiceRecordProps) {
  const router = useRouter();

  return (
    <div className='card'>
      <div className='ch'>
        <div className='ct'>
          Step 2 — Record Voiceprint
          <span className='ml-2 font-medium'>{pensionerName}</span>
        </div>
        <button className='btn-sm boutline text-[10px] px-2' onClick={onChange}>
          ← Change
        </button>
      </div>
      <div className='cb'>
        {/* Passphrase */}
        <p className='mb-2 text-mist-950 text-[11px]'>
          Ask the pensioner to say clearly:
        </p>
        <div className='bg-smoke text-ink text-center font-mono text-[13px] py-3 px-4 rounded-md mb-5 italic'>
          "{PASSPHRASE}"
        </div>

        <TakeProgress
          takes={takes}
          takesRequired={takesRequired}
          recording={recording}
          currentTake={currentTake}
        />

        <VoiceControls
          stage={stage}
          recording={recording}
          done={done}
          error={error}
          countdown={countdown}
          currentTake={currentTake}
          takesRequired={takesRequired}
          takes={takes}
          pensionerName={pensionerName}
          onRecord={onRecord}
          onRetry={onRetry}
        />

        {/* Done state */}
        {stage === "done" && (
          <>
            <div className='voice-box ok mb-4'>
              <span className='mic-icon'>✅</span>
              <p className='text-g1 font-semibold mb-2 text-[14px]'>
                Voice Enrolled!
              </p>
              <p className='text-muted text-[11px]'>
                {pensionerName}'s voiceprint ({takesRequired} samples averaged)
                has been stored for future verification.
              </p>
            </div>
            <div className='flex flex-wrap gap-4 justify-center'>
              <button className='btn-sm bgreen' onClick={onEnrolAnother}>
                Enrol Another
              </button>
              <button
                className='btn-sm boutline'
                onClick={() =>
                  router.push(`/dashboard/admin/pensioners/${selectedId}`)
                }>
                View Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
