"use client";
import { ChipRow } from "@/components/partner/ChipRow";
import { ContactBar } from "@/components/partner/ContactBar";
import { CTAButtons } from "@/components/partner/CTAbuttons";
import DeployGrid from "@/components/partner/DeployGrid";
import { FeatureGrid } from "@/components/partner/FeatureGrid";
import { ReadyPill } from "@/components/partner/ReadyPill";
import { Topbar } from "@/components/partner/Topbar";

export default function PartnerPage() {
  return (
    <div
      className='flex flex-col min-h-screen bg-[#001a08] overflow-hidden'
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Radial background glow */}
      <div
        className='pointer-events-none fixed inset-0'
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(200,150,12,0.06) 0%, transparent 60%)",
        }}
      />

      <Topbar />

      {/* Hero */}
      <main className='relative z-10 flex-1 flex flex-col items-center justify-center text-center px-10 py-10'>
        <ReadyPill />

        <h1 className='text-[clamp(26px,4vw,54px)] text-white font-bold leading-[1.1] mb-4 max-w-170'>
          Your State.{" "}
          <em className='not-italic text-[#e6ad0e]'>Zero Ghost Pensioners.</em>
          <br />
          Three Biometrics. One Score.
        </h1>

        <p className='text-[clamp(12px,1.5vw,16px)] text-white/46 max-w-130 mb-8 font-light leading-relaxed'>
          BPMLVS v2.0 is production-ready, 100% error-free, and built for
          Nigerian state governments. From pilot to full multi-modal deployment
          in under 90 days.
        </p>

        <ChipRow />
        <DeployGrid />
        <FeatureGrid />
        <CTAButtons />
        <ContactBar />
      </main>

      {/* Footer */}
      <footer className='relative z-10 border-t border-white/6 px-10 py-3 flex items-center justify-between'>
        <span className='text-[9px] text-white/22'>
          BPMLVS v2.0 · © 2025 Pension Technology Nigeria Ltd
        </span>
        <span className='text-[9px] text-white/22'>
          🇳🇬 Proudly Nigerian · NDPR Compliant · 100% Error-Free
        </span>
      </footer>
    </div>
  );
}
