export function AuthCard({
  badge,
  title,
  subtitle,
  children,
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className='w-full max-w-100'>
      {/* Status badge */}
      <div className='inline-flex items-center gap-1.5 bg-[#001407] text-white/75 text-[9.5px] font-semibold tracking-[1.4px] uppercase px-3.5 py-1.5 rounded-full mb-7'>
        <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
        {badge}
      </div>

      <h2
        className='text-[28px] font-bold text-[#0c190c] mb-1.5 leading-tight'
        style={{ fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h2>
      <p className='text-[13px] text-muted-foreground mb-8'>{subtitle}</p>

      {children}

      <div className='mt-7 text-center space-y-1.5'>
        <p className='text-[10px] text-[#a0b0a0]'>
          Proprietary &amp; Confidential — Authorised Personnel Only
        </p>
        <span className='block text-[9px] font-bold tracking-[1.2px] uppercase text-[#c8960c]'>
          BPMLVS v2.0
        </span>
      </div>
    </div>
  );
}
