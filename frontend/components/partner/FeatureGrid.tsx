import { Camera, Fingerprint, Mic, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <Camera size={22} />,
    title: "Face Liveness + LBP",
    desc: "512-float facial embedding with 4-signal liveness detection. Spoof-proof at every angle.",
    level: "L1+",
    color: "#1d4ed8",
    bg: "#eff6ff",
  },

  {
    icon: <Mic size={22} />,
    title: "MFCC Voiceprint",
    desc: "40-coefficient MFCC voice biometric with challenge-response anti-replay. 94%+ accuracy.",
    level: "L2+",
    color: "#6d28d9",
    bg: "#faf5ff",
  },
  {
    icon: <Zap size={22} />,
    title: "Fusion Engine",
    desc: "All three modalities fused into a single certainty score. One unfakeable identity signal.",
    level: "L3",
    color: "#166534",
    bg: "#f0fdf4",
  },
];

export function FeatureGrid() {
  return (
    <div className='grid grid-cols-2 gap-3 w-full max-w-2xl mb-7'>
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className='bg-white/5 border border-white/9 rounded-xl p-4 flex gap-3'>
          <div
            className='w-10 h-10 rounded-lg flex items-center justify-center shrink-0'
            style={{ background: f.bg + "22", color: f.color }}>
            {f.icon}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='text-white text-[12px] font-bold'>
                {f.title}
              </span>
              <span
                className='text-[8px] font-bold px-1.5 py-0.5 rounded-md'
                style={{ background: f.bg + "33", color: f.color }}>
                {f.level}
              </span>
            </div>
            <p className='text-white/44 text-[10.5px] leading-relaxed'>
              {f.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
