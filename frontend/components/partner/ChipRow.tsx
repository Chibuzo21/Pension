import {
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Fingerprint,
  Globe,
  Mic,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

interface Chip {
  label: string;
  gold: boolean;
  icon: React.ReactNode;
}

const CHIPS: Chip[] = [
  { label: "100% Error-Free", gold: true, icon: <CheckCircle2 size={11} /> },
  { label: "Face + LBP (512-float)", gold: false, icon: <Camera size={11} /> },

  { label: "MFCC Voice", gold: false, icon: <Mic size={11} /> },
  { label: "Fusion Engine", gold: true, icon: <Zap size={11} /> },
  { label: "Anti-Spoofing", gold: false, icon: <Shield size={11} /> },
  {
    label: "3 Assurance Levels L1–L3",
    gold: true,
    icon: <CheckCircle2 size={11} />,
  },
  { label: "NDPR Compliant", gold: false, icon: <Shield size={11} /> },
  { label: "WebRTC — No App", gold: true, icon: <Smartphone size={11} /> },
  { label: "90-Day Deployment", gold: false, icon: <Clock size={11} /> },
  { label: "Immutable Audit Trail", gold: false, icon: <FileText size={11} /> },
  { label: "Built for Nigeria 🇳🇬", gold: true, icon: <Globe size={11} /> },
];

export function ChipRow() {
  return (
    <div className='flex flex-wrap gap-2 justify-center mb-7 max-w-2xl'>
      {CHIPS.map((chip) =>
        chip.gold ? (
          <span
            key={chip.label}
            className='flex items-center gap-1.5 bg-[#c8960c]/15 border border-[#c8960c]/30 text-[#e6ad0e] text-[10.5px] font-semibold px-3 py-1.5 rounded-full'>
            {chip.icon}
            {chip.label}
          </span>
        ) : (
          <span
            key={chip.label}
            className='flex items-center gap-1.5 bg-white/[0.07] border border-white/11 text-white/64 text-[10.5px] font-semibold px-3 py-1.5 rounded-full'>
            {chip.icon}
            {chip.label}
          </span>
        ),
      )}
    </div>
  );
}
