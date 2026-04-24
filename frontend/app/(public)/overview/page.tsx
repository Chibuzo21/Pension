"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { BarChart2, ShieldCheck, Play } from "lucide-react";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useCounter } from "@/hooks/useCounter";
import { ModalityPill } from "@/components/overview/ModalityPill";
import { StatBlock } from "@/components/overview/StatBlock";

export default function CoverPage() {
  const [started, setStarted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // kick off counters once mounted
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(timer);
  }, []);
  const { user } = useUser();
  const isStuck =
    user &&
    !user.unsafeMetadata?.onboardingComplete &&
    user?.publicMetadata?.role === "pensioner";

  const cnt186 = useCounter(186, 1800, started);
  const cnt23 = useCounter(23, 1400, started);

  return (
    <div
      className='flex flex-col h-full min-h-screen bg-[#001a08]  relative'
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* ── Radial background gradients ── */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 110% 40%, rgba(200,150,12,0.12) 0%, transparent 58%),
            radial-gradient(ellipse 60% 80% at -10% 80%, rgba(0,80,0,0.40) 0%, transparent 58%)
          `,
        }}
      />

      {/* ── Top header ── */}
      <header className='relative z-10 flex items-center justify-between px-10 py-5'>
        {/* Brand */}
        <div className='flex items-center gap-3'>
          <span className='text-[26px]'>🇳🇬</span>
          <div>
            <p className='text-white/85 text-[10px] font-semibold tracking-[1.6px] uppercase leading-snug'>
              Federal Republic of Nigeria
            </p>
            <p className='text-[#e6ad0e] text-[8.5px] font-normal tracking-wide'>
              Pension Administration Technology
            </p>
          </div>
        </div>

        {/* Version badge */}
        <div className='bg-[#c8960c]/18 border border-[#c8960c]/35 text-[#e6ad0e] text-[9px] font-bold tracking-[1.2px] uppercase px-3 py-1.5 rounded-full'>
          v2.0 · Multi-Modal · 2025
        </div>
      </header>

      {/* ── Hero ── */}
      <main
        ref={heroRef}
        className='relative z-10 flex-1 flex flex-col items-center justify-center text-center md:px-10 py-8 px-5'>
        {/* Live eyebrow pill */}
        <div className='flex items-center gap-2 bg-[#c8960c]/13 border border-[#c8960c]/30 text-[#e6ad0e] text-[9px] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full mb-5'>
          <span className='w-1.5 h-1.5 rounded-full bg-[#e6ad0e] animate-pulse' />
          Multi-Modal Biometric Pension Verification
        </div>

        {/* H1 */}
        <h1
          className='font-bold text-white leading-[1.1] tracking-tight mb-4 max-w-205'
          style={{ fontSize: "clamp(30px, 4.5vw, 58px)" }}>
          Ending Nigeria's
          <br />
          <em className='not-italic text-[#e6ad0e]'>Ghost Pensioner Crisis</em>
          <br />
          With Maximum Certainty
        </h1>

        {/* Subheading */}
        <p
          className='text-white/50 max-w-145 mb-7 font-light leading-relaxed'
          style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>
          BPMLVS v2.0 fuses face and voice biometrics into one unfakeable score
          — the strongest pension identity system ever deployed in Africa.
        </p>

        <div className='flex gap-2 justify-center flex-wrap mb-7'>
          <ModalityPill label='📷 Face + LBP (512-float)' />

          <ModalityPill label='🎙️ Voice — MFCC Voiceprint' />
          <ModalityPill label='⚡ Fusion Engine' />
          <ModalityPill label='🛡 Anti-Spoofing' />
        </div>

        {/* Stats bar */}
        <div className='flex w-full max-w-170 mb-7 bg-white/5 border border-white/8 rounded-xl'>
          <StatBlock
            value={
              <>
                ₦<span>{cnt186}</span>B
              </>
            }
            label='Lost to fraud yearly'
          />
          <StatBlock value={<>{cnt23}%</>} label='Ghost pensioner rate' />
          <StatBlock value='4' label='Assurance levels' />
          <StatBlock value='99.7%' label='System uptime SLA' border={false} />
        </div>

        {/* CTA buttons */}
        <div className='flex gap-3 flex-col md:flex-row justify-center mb-5'>
          <Link href='/crisis'>
            <Button className='bg-[#c8960c] hover:bg-[#e6ad0e] text-black font-bold px-6 py-3 h-auto text-[13px] rounded-lg transition-all hover:-translate-y-px shadow-lg shadow-[#c8960c]/20 w-full'>
              <BarChart2 size={15} className='mr-2' />
              📊 See the Crisis
            </Button>
          </Link>
          <Link href='/dashboard/portal/verify'>
            <Button
              variant='outline'
              className='bg-transparent w-full border border-white/20 text-white/75 hover:bg-white/[0.07] hover:text-white hover:border-white font-semibold px-6 py-3 h-auto text-[13px] rounded-lg'>
              <Play size={14} className='mr-2' />
              🔐 Live Multi-Modal Demo →
            </Button>
          </Link>
        </div>
        {isStuck && (
          <div className='fixed bottom-20 right-6 bg-white border border-red-200 rounded-xl shadow-lg p-4 max-w-xs text-sm'>
            <p className='font-semibold text-gray-800 mb-1'>
              Account not linked
            </p>
            <p className='text-gray-500 mb-3'>
              Your account isn't connected to a pension record.{" "}
              <Link
                href='/onboarding'
                className='text-green-700 font-medium underline'>
                Try again
              </Link>{" "}
              or sign out and use the correct account.
            </p>
            <SignOutButton redirectUrl='/sign-in'>
              <button className='w-full text-center text-red-600 font-semibold hover:underline'>
                Sign out
              </button>
            </SignOutButton>
          </div>
        )}
      </main>

      {/* ── Version strip ── */}
      <div className='relative z-10 bg-[#c8960c]/9 border-t border-[#c8960c]/20 px-10 py-2.5 flex items-center justify-center gap-4 flex-wrap'>
        <span className='bg-[#c8960c]/18 border border-[#c8960c]/35 text-[#e6ad0e] text-[8.5px] font-bold px-2 py-0.5 rounded-lg tracking-[0.8px] uppercase'>
          v2.0
        </span>
        <span className='text-[10.5px] text-white/38'>
          Face (512-float + LBP) · · MFCC Voice · Fusion Engine · 4 Assurance
          Levels · 100% Error-Free
        </span>
        <span className='bg-[#c8960c]/.18 border border-[#c8960c]/35 text-[#e6ad0e] text-[8.5px] font-bold px-2 py-0.5 rounded-lg tracking-[0.8px] uppercase'>
          Production Ready
        </span>
      </div>

      {/* ── Footer ── */}
      <footer className='relative z-10 flex items-center justify-between md:px-10 px-5 py-3 border-t border-white/6 text-[9px] text-white/22'>
        <span>
          BPMLVS v2.0 · Multi-Modal Biometric Pensioner Verification System
        </span>
        <span>Proprietary &amp; Confidential — Government Evaluation Only</span>
      </footer>
    </div>
  );
}
