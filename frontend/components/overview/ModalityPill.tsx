export function ModalityPill({ label }: { label: string }) {
  return (
    <div className='flex items-center gap-2 bg-white/[0.07] border border-white/12 text-white/70 text-[10.5px] font-semibold px-3 py-1.5 rounded-full'>
      <span className='w-1.5 h-1.5 rounded-full bg-[#e6ad0e] shrink-0' />
      {label}
    </div>
  );
}
