interface TakeProgressProps {
  takes: unknown[];
  takesRequired: number;
  recording: boolean;
  currentTake: number;
}

export function TakeProgress({
  takes,
  takesRequired,
  recording,
  currentTake,
}: TakeProgressProps) {
  return (
    <>
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
    </>
  );
}
