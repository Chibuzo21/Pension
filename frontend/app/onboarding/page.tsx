"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [nin, setNin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.nin) {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || user?.unsafeMetadata?.nin) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nin.trim().toUpperCase();

    if (!/^[A-Z0-9]{11}$/.test(trimmed)) {
      setError("Enter a valid 11-character NIN");
      return;
    }

    setLoading(true);
    try {
      await user!.update({
        unsafeMetadata: { nin: trimmed, onboardingComplete: true },
      });
      await user!.reload();
      await new Promise((res) => setTimeout(res, 1500));
      router.replace("/");
    } catch (e) {
      setError(getErrorMessage(e, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  const ninLength = nin.trim().length;
  const isComplete = ninLength === 11;

  return (
    <div className='min-h-screen flex bg-[#001407]'>
      {/* ── Left panel (hidden on mobile) ── */}
      <div className='hidden lg:flex w-[52%] shrink-0 flex-col justify-between relative overflow-hidden px-14 py-11'>
        {/* Grid texture */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(200,150,12,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,150,12,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow orb */}
        <div
          className='pointer-events-none absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full'
          style={{
            background:
              "radial-gradient(circle, rgba(0,77,25,0.55) 0%, transparent 70%)",
          }}
        />
        {/* Gold stripe */}
        <div
          className='absolute top-0 bottom-0 right-0 w-0.75 opacity-60'
          style={{
            background:
              "linear-gradient(to bottom, transparent, #c8960c 40%, #c8960c 60%, transparent)",
          }}
        />

        <div className='relative z-10'>
          {/* Shield + branding */}
          <div className='flex items-center gap-3.5 mb-16'>
            <svg
              width='44'
              height='44'
              viewBox='0 0 44 44'
              fill='none'
              className='shrink-0'>
              <path
                d='M22 3L38 10V22C38 31.5 30.5 39.2 22 41C13.5 39.2 6 31.5 6 22V10L22 3Z'
                fill='#004d19'
                stroke='#c8960c'
                strokeWidth='1.5'
              />
              <path
                d='M22 3L38 10V22C38 31.5 30.5 39.2 22 41'
                fill='rgba(0,77,25,0.4)'
              />
              <path
                d='M16 20C16 17.8 17.8 16 20 16H24C26.2 16 28 17.8 28 20V24C28 26.2 26.2 28 24 28H20C17.8 28 16 26.2 16 24V20Z'
                fill='rgba(200,150,12,0.25)'
                stroke='rgba(200,150,12,0.5)'
                strokeWidth='0.75'
              />
              <circle cx='22' cy='22' r='2.5' fill='#c8960c' opacity='0.9' />
            </svg>
            <div className='leading-tight'>
              <p className='text-[9px] font-semibold tracking-[2.4px] uppercase text-[#c8960c]/85'>
                Federal Republic of Nigeria
              </p>
              <p className='text-[11px] font-medium text-white/55'>
                Pension Commission — PENCOM
              </p>
            </div>
          </div>

          <h1
            className='text-[42px] font-black leading-[1.08] tracking-[-0.5px] text-white mb-5'
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Account
            <br />
            <em className='not-italic text-[#c8960c]'>Setup</em>
          </h1>

          <p className='text-[13px] font-light text-white/45 leading-[1.75] max-w-[320px]'>
            Link your Clerk account to your pension record using your National
            Identification Number. This is a one-time step.
          </p>

          {/* Steps */}
          <div className='mt-11 flex flex-col gap-5'>
            {[
              { n: "01", label: "Enter your NIN", done: isComplete },
              {
                n: "02",
                label: "System verifies your pension file",
                done: false,
              },
              {
                n: "03",
                label: "Access your verification portal",
                done: false,
              },
            ].map(({ n, label, done }) => (
              <div key={n} className='flex items-center gap-4'>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${
                    done
                      ? "bg-[#c8960c] text-black"
                      : "border border-white/20 text-white/30"
                  }`}>
                  {n}
                </div>
                <span
                  className={`text-[12px] transition-colors duration-300 ${done ? "text-white/80" : "text-white/35"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='relative z-10'>
          <div className='w-9 h-0.5 bg-[#c8960c] rounded-full mb-3.5' />
          <p className='text-[10px] font-medium tracking-[0.8px] uppercase text-white/22'>
            BPMLVS v2.0 · One-time Setup
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-6 sm:px-10 py-12'>
        {/* Top gradient rule */}
        <div
          className='absolute top-0 left-0 right-0 h-[3px]'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />

        <div className='w-full max-w-[420px]'>
          {/* Badge */}
          <div className='inline-flex items-center gap-1.5 bg-[#001407] text-white/75 text-[9.5px] font-semibold tracking-[1.4px] uppercase px-3.5 py-1.5 rounded-full mb-7'>
            <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
            One-time Setup
          </div>

          <h2
            className='text-[28px] font-bold text-[#0c190c] mb-2 leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Link your pension record
          </h2>
          <p className='text-[13px] text-[#768876] mb-8 leading-relaxed'>
            Enter your NIN to connect your account to your pension file. This is
            required to access your verification portal.
          </p>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* NIN input */}
            <div>
              <label className='block text-[11px] font-semibold text-[#0c190c] uppercase tracking-[0.8px] mb-2'>
                National Identification Number (NIN)
              </label>

              <div className='relative'>
                <input
                  value={nin}
                  onChange={(e) => {
                    setNin(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder='e.g. AB12345678C'
                  maxLength={11}
                  autoFocus
                  className={`
                    w-full px-4 py-3 pr-16
                    font-mono text-[15px] tracking-[3px] uppercase
                    border-[1.5px] rounded-[9px] outline-none
                    bg-white transition-all duration-150
                    placeholder:tracking-normal placeholder:font-sans placeholder:text-[13px] placeholder:text-[#a0b0a0]
                    ${
                      error
                        ? "border-[#b91c1c] focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/10"
                        : isComplete
                          ? "border-[#004d19] focus:border-[#004d19] focus:ring-2 focus:ring-[#004d19]/10"
                          : "border-[#dce8dc] focus:border-[#004d19] focus:ring-2 focus:ring-[#004d19]/10"
                    }
                  `}
                />
                {/* Character counter */}
                <span
                  className={`
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-[11px] font-semibold tabular-nums transition-colors
                  ${isComplete ? "text-[#004d19]" : "text-[#a0b0a0]"}
                `}>
                  {ninLength}/11
                </span>
              </div>

              {/* Progress dots */}
              <div className='flex gap-1 mt-2.5'>
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                      i < ninLength
                        ? error
                          ? "bg-[#b91c1c]"
                          : "bg-[#004d19]"
                        : "bg-[#dce8dc]"
                    }`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className='flex items-center gap-1.5 mt-2'>
                  <AlertCircle className='w-3 h-3 text-[#b91c1c] shrink-0' />
                  <p className='text-[11px] text-[#b91c1c]'>{error}</p>
                </div>
              )}
            </div>

            {/* Info box */}
            <div className='flex gap-3 bg-[#f0faf0] border border-[#c6e8c6] rounded-[9px] px-4 py-3'>
              <ShieldCheck className='w-4 h-4 text-[#004d19] shrink-0 mt-0.5' />
              <p className='text-[11.5px] text-[#4a5e4a] leading-relaxed'>
                Your NIN is encrypted and only used to locate your pension
                record. It will not be shared with third parties.
              </p>
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={loading || !isComplete}
              className={`
                w-full flex items-center justify-center gap-2
                py-3 px-6 rounded-[9px]
                text-[13.5px] font-semibold text-white
                transition-all duration-150
                ${
                  loading || !isComplete
                    ? "bg-[#004d19]/40 cursor-not-allowed"
                    : "bg-[#004d19] hover:bg-[#003311] hover:-translate-y-px active:translate-y-0 cursor-pointer"
                }
              `}>
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Linking your record…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>
          </form>

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
