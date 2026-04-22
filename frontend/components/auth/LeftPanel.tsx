import { ShieldIcon } from "lucide-react";

const features = [
  "Multi-modal biometric capture (face, fingerprint, voice)",
  "Real-time liveness detection & anti-spoofing",
  "Cross-MDA pensioner registry with audit trail",
  "Automated compliance reporting & reminders",
];

export function LeftPanel() {
  return (
    <div
      className='
        hidden lg:flex
        w-[52%] shrink-0 flex-col justify-between
        relative overflow-hidden
        bg-[#001407]
        px-14 py-11
      '>
      {/* Gold grid texture */}
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

      {/* Top-right glow orb */}
      <div
        className='pointer-events-none absolute -top-32 -right-32 w-110 h-110 rounded-full'
        style={{
          background:
            "radial-gradient(circle, rgba(0,77,25,0.55) 0%, transparent 70%)",
        }}
      />

      {/* Right-edge gold stripe */}
      <div
        className='absolute top-0 bottom-0 right-0 w-0.75 opacity-60'
        style={{
          background:
            "linear-gradient(to bottom, transparent, #c8960c 40%, #c8960c 60%, transparent)",
        }}
      />

      {/* ── Top content ── */}
      <div className='relative z-10'>
        {/* Branding mark */}
        <div className='flex items-center gap-3.5 mb-16'>
          {/* Stylised shield */}
          <svg
            width='44'
            height='44'
            viewBox='0 0 44 44'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
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

        {/* Headline */}
        <h1
          className='text-[46px] font-black leading-[1.08] tracking-[-0.5px] text-white mb-5'
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Biometric
          <br />
          <em className='not-italic text-[#c8960c]'>Verification</em>
          <br />
          Portal
        </h1>

        <p className='text-[13px] font-light text-white/45 leading-[1.75] max-w-85'>
          Secure, multi-modal liveness verification for pension entitlement
          administration across all Federal MDAs.
        </p>

        {/* Feature bullets */}
        <ul className='mt-11 flex flex-col gap-3'>
          {features.map((f) => (
            <li key={f} className='flex items-center gap-2.5'>
              <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] shrink-0' />
              <span className='text-[11.5px] text-white/50'>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Bottom stamp ── */}
      <div className='relative z-10'>
        <div className='w-9 h-0.5 bg-[#c8960c] rounded-full mb-3.5' />
        <p className='text-[10px] font-medium tracking-[0.8px] uppercase text-white/22'>
          BPMLVS v2.0 · Classified System · Authorised Use Only
        </p>
      </div>
    </div>
  );
}
