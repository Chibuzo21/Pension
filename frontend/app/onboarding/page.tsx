"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LeftPanel } from "@/components/onboarding/LeftPanel";
import { NinInput } from "@/components/onboarding/NinInput";
import { VerificationCard } from "@/components/onboarding/VerificationCard";
import { getErrorMessage } from "@/lib/errors";

type VerifiedRecord = { name: string; pensionId: string };

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [nin, setNin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<VerifiedRecord | null>(null);

  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.nin) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded || user?.unsafeMetadata?.nin) return null;

  const isComplete = nin.trim().length === 11;

  const steps = [
    { n: "01", label: "Enter your NIN", done: isComplete },
    { n: "02", label: "System verifies your pension file", done: !!verified },
    { n: "03", label: "Access your verification portal", done: false },
  ];

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nin.trim().toUpperCase();
    if (!/^[A-Z0-9]{11}$/.test(trimmed))
      return setError("Enter a valid 11-character NIN");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/validate-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Could not verify your NIN");
      setVerified({ name: data.name, pensionId: data.pensionId });
    } catch (e) {
      setError(getErrorMessage(e, "Something went wrong — please try again"));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await user!.update({
        unsafeMetadata: {
          nin: nin.trim().toUpperCase(),
          onboardingComplete: true,
        },
      });
      await user!.reload();
      await new Promise((res) => setTimeout(res, 1500));
      router.replace("/dashboard");
    } catch (e) {
      setError(
        getErrorMessage(e, "Failed to link your account — please try again"),
      );
      setVerified(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex bg-[#001407]'>
      <LeftPanel steps={steps} />

      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-6 sm:px-10 py-12'>
        <div
          className='absolute top-0 left-0 right-0 h-0.75'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />

        <div className='w-full max-w-105'>
          <div className='inline-flex items-center gap-1.5 bg-[#001407] text-white/75 text-[9.5px] font-semibold tracking-[1.4px] uppercase px-3.5 py-1.5 rounded-full mb-7'>
            <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
            One-time Setup
          </div>

          <h2
            className='text-[28px] font-bold text-[#0c190c] mb-2 leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Link your pension record
          </h2>
          <p className='text-[13px] text-muted-foreground mb-8 leading-relaxed'>
            Enter your NIN to connect your account to your pension file. This is
            required to access your verification portal.
          </p>

          {verified ? (
            <VerificationCard
              name={verified.name}
              pensionId={verified.pensionId}
              error={error}
              loading={loading}
              onConfirm={handleConfirm}
              onBack={() => {
                setVerified(null);
                setError("");
              }}
            />
          ) : (
            <NinInput
              nin={nin}
              error={error}
              loading={loading}
              onChange={(val) => {
                setNin(val);
                setError("");
              }}
              onSubmit={handleValidate}
            />
          )}

          <p className='text-center text-[10px] text-[#a0b0a0] mt-8'>
            Having trouble?{" "}
            <a
              href='mailto:support@pencom.gov.ng'
              className='text-[#c8960c] hover:text-[#e6ad0e] font-semibold transition-colors'>
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
