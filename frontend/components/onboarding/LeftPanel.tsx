type Step = { n: string; label: string; done: boolean };

type LeftPanelProps = {
  steps: Step[];
};

export function LeftPanel({ steps }: LeftPanelProps) {
  return (
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
        className='pointer-events-none absolute -top-32 -right-32 w-110 h-110 rounded-full'
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
        {/* Logo + title */}
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

        <div className='mt-11 flex flex-col gap-5'>
          {steps.map(({ n, label, done }) => (
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
                className={`text-[12px] transition-colors duration-300 ${
                  done ? "text-white/80" : "text-white/35"
                }`}>
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
  );
}
