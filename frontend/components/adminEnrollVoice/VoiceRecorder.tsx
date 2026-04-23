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
    <div className='bg-white border border-[var(--mist)] rounded-[11px] shadow-[0_1px_5px_rgba(0,50,0,0.07)] overflow-hidden'>
      {/* Card header */}
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-[var(--smoke)]'>
        <p className='text-[11.5px] font-bold text-[var(--ink)]'>
          Step 2 — Record Voiceprint
          <span className='ml-2 font-medium text-[var(--slate)]'>
            {pensionerName}
          </span>
        </p>
        <button
          onClick={onChange}
          className='text-[10px] font-semibold px-2.5 py-1 rounded-[7px] border border-[var(--mist)] text-[var(--slate)] bg-transparent hover:border-[var(--g1)] hover:text-[var(--g1)] transition-all duration-150'>
          ← Change
        </button>
      </div>

      {/* Card body */}
      <div className='p-4'>
        <p className='mb-2 text-[11px] text-[var(--slate)]'>
          Ask the pensioner to say clearly:
        </p>
        <div className='bg-[var(--smoke)] text-[var(--ink)] text-center font-mono text-[13px] py-3 px-4 rounded-[8px] mb-5 italic'>
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
            <div className='border-2 border-[var(--g1)] bg-[#f0faf0] rounded-[9px] p-5 text-center mb-4 transition-all duration-300'>
              <span className='text-[40px] mb-2 block'>✅</span>
              <p className='text-[var(--g1)] font-semibold text-[14px] mb-1.5'>
                Voice Enrolled!
              </p>
              <p className='text-[11px] text-[var(--slate)]'>
                {pensionerName}'s voiceprint ({takesRequired} samples averaged)
                has been stored for future verification.
              </p>
            </div>
            <div className='flex flex-wrap gap-3 justify-center'>
              <button
                onClick={onEnrolAnother}
                className='bg-[var(--g1)] hover:bg-[var(--g2)] text-white text-[11px] font-semibold py-1.5 px-4 rounded-[7px] transition-all duration-150'>
                Enrol Another
              </button>
              <button
                onClick={() =>
                  router.push(`/dashboard/admin/pensioners/${selectedId}`)
                }
                className='bg-transparent border border-[var(--mist)] text-[var(--slate)] hover:border-[var(--g1)] hover:text-[var(--g1)] text-[11px] font-semibold py-1.5 px-4 rounded-[7px] transition-all duration-150'>
                View Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
