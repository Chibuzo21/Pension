type StageType =
  | "search"
  | "ready"
  | "recording"
  | "processing"
  | "done"
  | "failed";

interface VoiceControlProps {
  stage: StageType;
  recording: boolean;
  done: boolean;
  error: string;
  countdown: number;
  currentTake: number;
  takesRequired: number;
  takes: unknown[];
  pensionerName: string;
  onRecord: () => void;
  onRetry: () => void;
}

export function VoiceControls({
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
}: VoiceControlProps) {
  if ((stage === "ready" || stage === "failed") && !done) {
    return (
      <>
        <div className='border-2 border-dashed border-[var(--mist)] rounded-[9px] p-5 text-center mb-4 transition-all duration-300'>
          <span className='text-[40px] mb-2 block'>🎙️</span>
          {stage === "failed" && (
            <p className='text-[var(--red)] font-bold text-[12px] mb-3'>
              {error}
            </p>
          )}
          <p className='text-[12px] text-[var(--slate)]'>
            {takes.length === 0
              ? "Click Record for Take 1. The pensioner speaks the passphrase each time."
              : `${takes.length} take${takes.length > 1 ? "s" : ""} done — click Record for Take ${currentTake}.`}
          </p>
        </div>

        <button
          onClick={onRecord}
          disabled={recording}
          className='w-full bg-[var(--gold)] hover:bg-[var(--gold2)] text-black font-bold text-[13px] py-2.5 px-6 rounded-[8px] transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed'>
          🔴 Record Take {currentTake} (6s)
        </button>

        {takes.length > 0 && (
          <button
            onClick={onRetry}
            className='w-full mt-2 bg-transparent border border-[var(--mist)] text-[var(--slate)] hover:border-[var(--g1)] hover:text-[var(--g1)] text-[11px] font-semibold py-1.5 px-4 rounded-[7px] transition-all duration-150'>
            ↺ Start Over
          </button>
        )}
      </>
    );
  }

  if (recording) {
    return (
      <div className='border-2 border-[var(--red)] bg-[#fff5f5] rounded-[9px] p-5 text-center transition-all duration-300'>
        <span className='text-[40px] mb-2 block'>🔴</span>
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
    );
  }

  if (stage === "processing") {
    return (
      <div className='border-2 border-dashed border-[var(--mist)] rounded-[9px] p-5 text-center mb-4'>
        <span className='text-[40px] mb-2 block'>⏳</span>
        <p className='font-bold text-[14px] text-[var(--ink)] mb-1'>
          Building voiceprint from {takesRequired} samples…
        </p>
        <p className='text-[11px] text-[var(--slate)]'>
          Averaging embeddings for best accuracy
        </p>
      </div>
    );
  }

  return null;
}
