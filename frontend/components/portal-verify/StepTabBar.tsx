import { cn } from "@/lib/utils";
import { Camera, Mic, Shield, CheckCircle2, XCircle } from "lucide-react";
import type { Step, StepStatus } from "@/lib/biometric-utils";

interface StepDef {
  key: Step;
  icon: React.ReactNode;
  label: string;
  status: StepStatus | null;
  show: boolean;
}

interface Props {
  step: Step;
  setStep: (s: Step) => void;
  faceStatus: StepStatus;
  voiceStatus: StepStatus;
  hasVoice: boolean;
}

export function StepTabBar({
  step,
  setStep,
  faceStatus,
  voiceStatus,
  hasVoice,
}: Props) {
  const steps: StepDef[] = [
    {
      key: "face",
      icon: <Camera className='h-3.5 w-3.5' />,
      label: "Face",
      status: faceStatus,
      show: true,
    },
    {
      key: "voice",
      icon: <Mic className='h-3.5 w-3.5' />,
      label: "Voice",
      status: voiceStatus,
      show: hasVoice,
    },
    {
      key: "result",
      icon: <Shield className='h-3.5 w-3.5' />,
      label: "Result",
      status: null,
      show: true,
    },
  ];

  return (
    <div className='flex items-center gap-1 bg-muted rounded-xl p-1'>
      {steps
        .filter((s) => s.show)
        .map((s) => (
          <button
            key={s.key}
            onClick={() => s.key !== "result" && setStep(s.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
              step === s.key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}>
            {s.status === "done" ? (
              <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
            ) : s.status === "failed" ? (
              <XCircle className='h-3.5 w-3.5 text-red-500' />
            ) : (
              s.icon
            )}
            {s.label}
          </button>
        ))}
    </div>
  );
}
