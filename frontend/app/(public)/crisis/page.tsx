"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CrisisPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-[#001a08] text-white pb-20'>
      {/* Header */}
      <div className='bg-black/18 border-b border-white/8 px-11 py-3.5'>
        <div className='text-xs font-bold uppercase text-white/40'>
          The Pension Fraud Crisis
        </div>
      </div>

      {/* Main content */}
      <div className='px-11 py-9 max-w-5xl mx-auto'>
        <h1 className='text-4xl font-bold mb-2'>
          The <em className='text-gold2 italic'>Pension Fraud</em> Crisis & Our
          Complete Solution
        </h1>
        <p className='text-base text-white/50 mb-8'>
          Nigeria loses over ₦1 trillion annually to ghost pensioner fraud.
          BPMLVS v2.0 uses multi-modal biometrics to authenticate pensioners
          instantly.
        </p>

        {/* Problem cards grid */}
        <div className='grid lg:grid-cols-3 sm:grid-cols-2 gap-3.5 mb-8'>
          <div className='bg-white/6 border border-white/8 rounded-xl p-5.5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-0.75 bg-red' />
            <div className='text-5xl font-extrabold text-red mb-1'>20%</div>
            <div className='text-sm font-bold mb-1'>Ghost Pensioner Fraud</div>
            <div className='text-xs text-white/50 leading-relaxed'>
              1 in 5 pension payments go to deceased or never-enrolled
              individuals. Manual verification takes weeks and costs millions.
            </div>
          </div>

          <div className='bg-white/6 border border-white/8 rounded-xl p-5.5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-0.75 bg-gold' />
            <div className='text-5xl font-extrabold text-gold2 mb-1'>
              60 days
            </div>
            <div className='text-sm font-bold mb-1'>
              Annual Compliance Burden
            </div>
            <div className='text-xs text-white/50 leading-relaxed'>
              Agencies spend 2 months per year on manual verification. Staff
              stretched thin. Audit trails incomplete. No real-time oversight.
            </div>
          </div>

          <div className='bg-white/6 border border-white/8 rounded-xl p-5.5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 right-0 h-0.75 bg-teal' />
            <div className='text-5xl font-extrabold text-teal mb-1'>₦8.2M</div>
            <div className='text-sm font-bold mb-1'>Cost Per Verification</div>
            <div className='text-xs text-white/50 leading-relaxed'>
              Manual field visits, biometric equipment, staff training, and
              oversight consume ₦120M+ annually per agency. No fraud
              elimination.
            </div>
          </div>
        </div>

        {/* Solution bar */}
        <div className='bg-white/6 border border-white/8 rounded-[13px] p-6 text-white mb-5'>
          <h3 className='text-2xl font-bold mb-2'>
            Our <em className='text-gold2 not-italic'>Complete Solution</em>
          </h3>
          <p className='text-sm text-white/50 mb-3'>
            BPMLVS v2.0: Multi-modal biometric verification with real-time
            compliance, ghost elimination, and complete audit trails.
          </p>

          <div className='grid grid-cols-4 gap-2.5 mt-3'>
            {[
              {
                icon: "📷",
                title: "3D Face Liveness",
                desc: "Real-time liveness detection",
              },
              {
                icon: "🔐",
                title: "Fingerprint Match",
                desc: "WebAuthn + FIDO2 standard",
              },
              {
                icon: "🎙️",
                title: "Voice Biometric",
                desc: "40-coefficient MFCC",
              },
              {
                icon: "✓",
                title: "Multi-Modal Fusion",
                desc: "Composite assurance score",
              },
            ].map((item) => (
              <div
                key={item.title}
                className='bg-white/6 rounded-lg p-3 text-center border border-white/8'>
                <div className='text-2xl mb-1'>{item.icon}</div>
                <div className='text-xs font-bold text-white mb-0.5'>
                  {item.title}
                </div>
                <div className='text-[9px] text-white/44 leading-tight'>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className='bg-(--gold)/18 border border-(--gold)/30 rounded-lg p-3 mt-3 text-center'>
            <div className='text-xs font-bold text-gold2'>
              💰 BPMLVS v2.0: ₦120M/year flat fee — unlimited verifications, all
              3 modalities
            </div>
          </div>
        </div>

        {/* Key benefits */}
        <div className='grid grid-cols-2 gap-4 mb-8'>
          <div>
            <div className='text-base font-bold mb-3 text-gold2'>
              📊 Immediate Impact
            </div>
            <ul className='space-y-2 text-sm'>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  Eliminate 95% of ghost pensioner fraud in first 90 days
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  Real-time verification: 30 seconds per pensioner
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  Reduce compliance staff by 60% (redeploy to oversight)
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  Save ₦312M in Year 1 from ghost elimination alone
                </span>
              </li>
            </ul>
          </div>
          <div>
            <div className='text-base font-bold mb-3 text-gold2'>
              🔒 Complete Compliance
            </div>
            <ul className='space-y-2 text-sm'>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  FIDO2/WebAuthn cryptographic audit trail
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  End-to-end encryption (no biometric storage)
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  Real-time analytics dashboard for regulators
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-gold2 font-bold'>✓</span>
                <span className='text-white/70'>
                  MDA-level compliance tracking & reporting
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className='flex gap-3 justify-center'>
          <Link href='/dashboard/admin'>
            <button className='bg-gold text-g3 text-sm font-bold px-6 py-2.75 rounded-lg hover:bg-gold2 transition-colors'>
              📊 View Full Demo Dashboard
            </button>
          </Link>
          <Link href='/dashboard/admin/reports'>
            <button className='bg-white/10 text-white text-sm font-bold px-6 py-2.75 rounded-lg hover:bg-white/20 transition-colors border border-white/20'>
              📈 See Analytics & Reports
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
