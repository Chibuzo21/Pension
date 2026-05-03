"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import VoiceEnrolWidget from "@/components/enroll/VoiceEnrollWidget";
import { Loader2, ShieldCheck } from "lucide-react";

export default function OnboardingVoicePage() {
  const { user } = useUser();
  const router = useRouter();
  const { pensioner, isLoaded } = useCurrentPensioner();

  async function handleVoiceDone() {
    await fetch("/api/onboarding/advance-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "docs" }),
    });
    await user!.reload();
    router.replace("/onboarding/docs");
  }

  return (
    <div className='min-h-screen flex bg-[#001407]'>
      {/* Left panel */}
      <div className='hidden lg:flex w-80 shrink-0 flex-col justify-between px-10 py-12'>
        <div>
          <div className='flex items-center gap-2.5 mb-16'>
            <div className='w-8 h-8 rounded-lg bg-[#c8960c]/20 border border-[#c8960c]/30 flex items-center justify-center'>
              <ShieldCheck className='w-4 h-4 text-[#c8960c]' />
            </div>
            <span className='text-white text-[11px] font-bold tracking-widest uppercase'>
              BPMLVS
            </span>
          </div>

          <div className='space-y-6'>
            {[
              { n: "01", label: "Identity verified", done: true },
              { n: "02", label: "Face recognition set up", done: true },
              {
                n: "03",
                label: "Record your voice",
                done: false,
                active: true,
              },
              { n: "04", label: "Upload documents", done: false },
            ].map(({ n, label, done, active }) => (
              <div key={n} className='flex items-center gap-3'>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border transition-all ${
                    done
                      ? "bg-[#c8960c] border-[#c8960c] text-black"
                      : active
                        ? "bg-white/10 border-white/40 text-white"
                        : "bg-transparent border-white/15 text-white/30"
                  }`}>
                  {done ? "✓" : n}
                </div>
                <span
                  className={`text-[12px] font-medium ${
                    done
                      ? "text-[#c8960c]"
                      : active
                        ? "text-white"
                        : "text-white/30"
                  }`}>
                  {label}
                </span>
                {active && (
                  <span className='ml-auto w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse' />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className='text-white/20 text-[10px] leading-relaxed'>
          Your voice data is stored as a mathematical representation, not a
          recording. It cannot be used to reconstruct your voice.
        </p>
      </div>

      {/* Right panel */}
      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-6 sm:px-10 py-12'>
        <div
          className='absolute top-0 left-0 right-0 h-0.75'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />

        {/* Step pills */}
        <div className='w-full max-w-lg mb-8'>
          <div className='flex items-center gap-1.5'>
            {["Personal", "Biometrics", "Documents"].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                  i === 1
                    ? "bg-[#001407] text-white"
                    : i === 0
                      ? "bg-[#001407]/15 text-[#001407]/60"
                      : "bg-[#001407]/10 text-[#001407]/40"
                }`}>
                {i === 0 && <span className='text-[#c8960c]'>✓</span>}
                {i === 1 && (
                  <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
                )}
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className='w-full max-w-lg'>
          <h2
            className='text-[26px] font-bold text-[#0c190c] mb-1 leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Record your voice
          </h2>
          <p className='text-[13px] text-muted-foreground mb-7 leading-relaxed'>
            You'll record the passphrase 3 times. Speak clearly and naturally —
            this builds your voice profile for monthly verification.
          </p>

          {!isLoaded ? (
            <div className='flex items-center justify-center h-48'>
              <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
            </div>
          ) : !pensioner ? (
            <div className='p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700'>
              Could not load your pensioner record. Please refresh or contact
              support.
            </div>
          ) : (
            <VoiceEnrolWidget
              pensionerId={pensioner._id}
              pensioner={pensioner}
              onDone={handleVoiceDone}
            />
          )}

          <p className='text-center text-[10px] text-[#a0b0a0] mt-6'>
            Step 3 of 4 — almost there
          </p>
        </div>
      </div>
    </div>
  );
}
