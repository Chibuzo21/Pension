export function StatBlock({
  value,
  label,
  border = true,
}: {
  value: React.ReactNode;
  label: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex-1 px-4 py-3.5 text-center ${
        border ? "border-r border-white/5" : ""
      }`}>
      <div className='text-[clamp(16px,2.2vw,28px)] font-bold text-[#e6ad0e] leading-none mb-1 font-mono'>
        {value}
      </div>
      <div className='text-[9px] text-white/36 tracking-[0.4px] uppercase'>
        {label}
      </div>
    </div>
  );
}
