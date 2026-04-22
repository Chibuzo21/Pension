"use client";

export default function ClosePage() {
  return (
    <div className='min-h-screen bg-g1 text-white pb-20'>
      {/* Main content */}
      <div className='px-11 py-20 text-center max-w-3xl mx-auto'>
        <div className='text-6xl mb-6 animate-bounce'>✨</div>

        <h1 className='text-5xl font-bold mb-4'>Implementation Complete</h1>
        <p className='text-xl text-white/70 mb-12'>
          Your state is now protected against pension fraud with real-time
          biometric verification.
        </p>

        {/* Success metrics */}
        <div className='grid grid-cols-3 gap-4 mb-12'>
          <div className='bg-white/10 border border-(--gold)/30 p-6 rounded-lg hover:bg-white/15 transition'>
            <div className='text-4xl font-bold text-gold2 mb-2'>24,847</div>
            <div className='text-sm text-white/70'>Pensioners Verified</div>
          </div>
          <div className='bg-white/10 border border-(--gold)/30 p-6 rounded-lg hover:bg-white/15 transition'>
            <div className='text-4xl font-bold text-gold2 mb-2'>₦312M</div>
            <div className='text-sm text-white/70'>Saved This Year</div>
          </div>
          <div className='bg-white/10 border border-(--gold)/30 p-6 rounded-lg hover:bg-white/15 transition'>
            <div className='text-4xl font-bold text-gold2 mb-2'>95%</div>
            <div className='text-sm text-white/70'>Fraud Eliminated</div>
          </div>
        </div>

        {/* Key achievements */}
        <div className='bg-white/8 border border-white/12 rounded-xl p-8 mb-12 text-left'>
          <h2 className='text-2xl font-bold mb-6 text-center'>
            What You've Accomplished
          </h2>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Real-Time Verification</div>
                  <div className='text-sm text-white/50'>
                    30 seconds per pensioner
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Multi-Modal Biometrics</div>
                  <div className='text-sm text-white/50'>
                    Face, Fingerprint, Voice
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Complete Audit Trail</div>
                  <div className='text-sm text-white/50'>
                    FIDO2/WebAuthn compliant
                  </div>
                </div>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Staff Efficiency</div>
                  <div className='text-sm text-white/50'>
                    60% reduction in compliance work
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Ghost Elimination</div>
                  <div className='text-sm text-white/50'>
                    95% reduction in fraud
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-gold2 text-2xl'>✓</span>
                <div>
                  <div className='font-bold'>Regulatory Compliance</div>
                  <div className='text-sm text-white/50'>
                    Real-time dashboard & reporting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className='space-y-4'>
          <button className='w-full bg-gold text-g3 font-bold py-4 rounded-lg hover:bg-gold2 transition-colors text-lg'>
            📧 Contact Our Team to Deploy
          </button>
          <button className='w-full bg-white/10 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20'>
            📞 Schedule a Demo
          </button>
        </div>

        {/* Footer note */}
        <div className='mt-12 pt-8 border-t border-white/10 text-white/50 text-sm'>
          <p>BPMLVS v2.0 — Multi-Modal Biometric Pension Verification System</p>
          <p className='mt-2'>Developed for Nigerian Federal Pension System</p>
        </div>
      </div>

      {/* Navigation Pills */}
    </div>
  );
}
