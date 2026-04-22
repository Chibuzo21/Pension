"use client";

import { Camera, Mic, Shield, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step, StepStatus } from "./types";

interface StepPillsProps {
  current: Step;
  faceStatus: StepStatus;
  voiceStatus: StepStatus;
  showVoice?: boolean;
  onStepClick: (step: Step) => void;
}

function statusIcon(status: StepStatus | null) {
  if (status === "done")
    return <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />;
  if (status === "failed")
    return <XCircle className='h-3.5 w-3.5 text-red-500' />;
  return null;
}

export function StepPills({
  current,
  faceStatus,
  voiceStatus,
  showVoice = true,
  onStepClick,
}: StepPillsProps) {
  const pills = [
    {
      key: "face" as Step,
      icon: <Camera className='h-3.5 w-3.5' />,
      label: "Face",
      status: faceStatus,
    },
    ...(showVoice
      ? [
          {
            key: "voice" as Step,
            icon: <Mic className='h-3.5 w-3.5' />,
            label: "Voice",
            status: voiceStatus,
          },
        ]
      : []),
    {
      key: "result" as Step,
      icon: <Shield className='h-3.5 w-3.5' />,
      label: "Result",
      status: null as StepStatus | null,
    },
  ];

  return (
    <div className='flex items-center gap-1 bg-muted rounded-xl p-1'>
      {pills.map(({ key, icon, label, status }) => {
        const override = statusIcon(status);
        return (
          <button
            key={key}
            onClick={() => key !== "result" && onStepClick(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg",
              "text-xs font-medium transition-all",
              current === key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}>
            {override ?? icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}
