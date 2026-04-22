import { Camera, Mic, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepStatus } from "./types";

interface ProgressStripProps {
  faceStatus: StepStatus;
  voiceStatus: StepStatus;
  showVoice?: boolean;
}

const STRIP_STYLES: Record<StepStatus, string> = {
  done: "bg-emerald-50 border-emerald-200 text-emerald-700",
  failed: "bg-red-50 border-red-200 text-red-600",
  capturing: "bg-blue-50 border-blue-200 text-blue-600",
  processing: "bg-blue-50 border-blue-200 text-blue-600",
  idle: "bg-muted/40 border-border text-muted-foreground",
};

function TrailingIcon({ status }: { status: StepStatus }) {
  if (status === "done")
    return <CheckCircle2 className='h-3 w-3 ml-auto shrink-0' />;
  if (status === "failed")
    return <XCircle className='h-3 w-3 ml-auto shrink-0' />;
  if (status === "processing" || status === "capturing")
    return <Loader2 className='h-3 w-3 ml-auto shrink-0 animate-spin' />;
  return null;
}

export function ProgressStrip({
  faceStatus,
  voiceStatus,
  showVoice = true,
}: ProgressStripProps) {
  const modalities = [
    {
      key: "face",
      label: "Face",
      icon: <Camera className='h-3 w-3' />,
      status: faceStatus,
    },
    ...(showVoice
      ? [
          {
            key: "voice",
            label: "Voice",
            icon: <Mic className='h-3 w-3' />,
            status: voiceStatus,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "grid gap-2",
        modalities.length === 2 ? "grid-cols-2" : "grid-cols-1",
      )}>
      {modalities.map(({ key, label, icon, status }) => (
        <div
          key={key}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium",
            STRIP_STYLES[status],
          )}>
          {icon}
          <span className='truncate'>{label}</span>
          <TrailingIcon status={status} />
        </div>
      ))}
    </div>
  );
}
