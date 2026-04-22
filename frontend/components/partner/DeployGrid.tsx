interface DeployCard {
  value: string;
  label: string;
  gold: boolean;
}

const DEPLOY_CARDS: DeployCard[] = [
  { value: "90", label: "Days to Deploy", gold: false },
  { value: "₦120M", label: "Annual Flat Fee", gold: true },
  { value: "24/7", label: "Support SLA", gold: false },
];
export default function DeployGrid() {
  return (
    <div className='grid grid-cols-3 gap-3 mb-7 w-full max-w-145'>
      {DEPLOY_CARDS.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl px-4 py-4 text-center ${
            card.gold
              ? "bg-[#c8960c]/10 border border-[#c8960c]/25"
              : "bg-white/6 border border-white/.10"
          }`}>
          <div className='text-[26px] font-extrabold text-[#e6ad0e] mb-1 leading-none'>
            {card.value}
          </div>
          <div className='text-[9px] font-semibold text-white/36 uppercase tracking-[0.8px]'>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
