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
  pensionerName,
  onRecord,
  onRetry,
}: VoiceControlProps) {
  if ((stage === "ready" || stage === "failed") && !done) {
    return (
      <>
        <div className='voice-box mb-4'>
          <span className='mic-icon'>🎙️</span>
          {stage === "failed" && (
            <p
              style={{ fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>
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
          onClick={onRecord}
          disabled={recording}>
          🔴 Record Take {currentTake} (6s)
        </button>
        {takes.length > 0 && (
          <button className='btn-sm boutline w-full mt-2' onClick={onRetry}>
            ↺ Start Over
          </button>
        )}
      </>
    );
  }

  if (recording) {
    return (
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
    );
  }

  if (stage === "processing") {
    return (
      <div className='voice-box mb-4'>
        <span className='mic-icon'>⏳</span>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          Building voiceprint from {takesRequired} samples…
        </p>
        <p style={{ fontSize: 11, color: "var(--muted)" }}>
          Averaging embeddings for best accuracy
        </p>
      </div>
    );
  }

  return null;
}
