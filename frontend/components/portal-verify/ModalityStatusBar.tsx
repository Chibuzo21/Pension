import { cn } from "@/lib/utils";
import { Camera, Mic, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { StepStatus } from "@/lib/biometric-utils";

interface Modality {
  key: string;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  show: boolean;
}

interface Props {
  faceStatus: StepStatus;
  voiceStatus: StepStatus;
  hasVoice: boolean;
}

export function ModalityStatusBar({
  faceStatus,
  voiceStatus,
  hasVoice,
}: Props) {
  const modalities: Modality[] = [
    {
      key: "face",
      label: "Face",
      icon: <Camera className='h-3 w-3' />,
      status: faceStatus,
      show: true,
    },
    {
      key: "voice",
      label: "Voice",
      icon: <Mic className='h-3 w-3' />,
      status: voiceStatus,
      show: hasVoice,
    },
  ];

  return (
    <div className={cn("grid gap-2", hasVoice ? "grid-cols-2" : "grid-cols-1")}>
      {modalities
        .filter((m) => m.show)
        .map((m) => (
          <div
            key={m.key}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium",
              m.status === "done" &&
                "bg-emerald-50 border-emerald-200 text-emerald-700",
              m.status === "failed" && "bg-red-50 border-red-200 text-red-600",
              (m.status === "processing" || m.status === "capturing") &&
                "bg-blue-50 border-blue-200 text-blue-600",
              m.status === "idle" &&
                "bg-muted/40 border-border text-muted-foreground",
            )}>
            {m.icon}
            <span className='truncate'>{m.label}</span>
            <span className='ml-auto'>
              {m.status === "done" ? (
                <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
              ) : m.status === "failed" ? (
                <XCircle className='h-3.5 w-3.5 text-red-500' />
              ) : m.status === "processing" || m.status === "capturing" ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin text-blue-500' />
              ) : null}
            </span>
          </div>
        ))}
    </div>
  );
}
