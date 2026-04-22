"use client";
import VoiceEnrolWidget from "./VoiceEnrollWidget";
import FaceEnrolWidget from "./FaceEnrollWidget";
import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Tab = "face" | "voice";
type BiometricState = {
  faceDone: boolean;
  voiceDone: boolean;
  setFaceDone: React.Dispatch<React.SetStateAction<boolean>>;
  setVoiceDone: React.Dispatch<React.SetStateAction<boolean>>;
};
type pension = {
  pensionerId: Id<"pensioners">;
  pensioner: Doc<"pensioners">;
};
export default function TabSwitcher({
  biometric,
  pension,
}: {
  biometric: BiometricState;
  pension: pension;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("face");
  const { faceDone, voiceDone, setFaceDone, setVoiceDone } = biometric;
  const { pensionerId, pensioner } = pension;
  return (
    <>
      {/* Tab switcher */}
      <div className='flex gap-2 bg-smoke rounded-xl p-1'>
        <button
          onClick={() => setActiveTab("face")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "face"
              ? "bg-white shadow-sm text-ink"
              : "text-muted-foreground hover:text-ink"
          }`}>
          📷 Face
          {faceDone && <span className='text-emerald-500'>✓</span>}
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "voice"
              ? "bg-white shadow-sm text-ink"
              : "text-muted-foreground hover:text-ink"
          }`}>
          🎙️ Voice
          {voiceDone && <span className='text-emerald-500'>✓</span>}
        </button>
      </div>

      {/* Widgets */}
      {activeTab === "face" && (
        <FaceEnrolWidget
          pensionerId={pensionerId}
          pensioner={pensioner}
          onDone={() => {
            setFaceDone(true);
            // Auto-advance to voice tab if not done yet
            if (!voiceDone) setTimeout(() => setActiveTab("voice"), 800);
          }}
        />
      )}

      {activeTab === "voice" && (
        <VoiceEnrolWidget
          pensionerId={pensionerId}
          pensioner={pensioner}
          onDone={() => setVoiceDone(true)}
        />
      )}

      <p className='text-[11px] text-muted-foreground text-center'>
        Each biometric saves immediately. You can enrol face and voice
        independently.
      </p>
    </>
  );
}
