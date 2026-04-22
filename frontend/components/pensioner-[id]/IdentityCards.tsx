import { format } from "date-fns";
import { ShieldCheck, Camera, Mic } from "lucide-react";
import { InfoRow, Initials, LevelChip } from "./ui-primitives";
import { Doc } from "@/convex/_generated/dataModel";

export function IdentityCard({ pensioner }: { pensioner: Doc<"pensioners"> }) {
  return (
    <div className='rounded-2xl overflow-hidden border border-white/5 shadow-md'>
      {/* dark header */}
      <div className='bg-[#001a08] px-5 py-5 flex flex-col items-center gap-3 border-b border-white/5'>
        <Initials name={pensioner.fullName} size='md' />
        <div className='text-center'>
          <p className='text-[14px] font-bold text-white leading-tight'>
            {pensioner.fullName}
          </p>
          <p className='text-[11px] text-white/30 font-mono mt-1'>
            {pensioner.pensionId}
          </p>
        </div>
      </div>
      {/* dark body */}
      <div className='bg-[#003311] px-5 pb-2'>
        <InfoRow label='Phone' value={pensioner.phone} />
        <InfoRow label='NIN' value={pensioner.nin} />
        {(pensioner.bankName || pensioner.accountNumber) && (
          <InfoRow
            label='Bank'
            value={[pensioner.bankName, pensioner.accountNumber]
              .filter(Boolean)
              .join(" · ")}
          />
        )}
        <InfoRow label='Address' value={pensioner.address} />
      </div>
    </div>
  );
}

export function BiometricsCard({
  pensioner,
  level,
}: {
  pensioner: Doc<"pensioners">;
  level: string;
}) {
  const modalities = [
    {
      icon: <Camera className='h-3.5 w-3.5 text-[#4a5e4a]' />,
      label: "Face",
      enrolled: !!pensioner.faceEncoding,
    },
    {
      icon: <Mic className='h-3.5 w-3.5 text-[#4a5e4a]' />,
      label: "Voice",
      enrolled: !!pensioner.voiceEncoding,
    },
  ];

  return (
    <div className='rounded-2xl border border-[#dce6dc] bg-white overflow-hidden shadow-sm mt-3'>
      {/* section header */}
      <div className='flex items-center gap-2 px-4 py-3 bg-[#f5f7f5] border-b border-[#dce6dc]'>
        <ShieldCheck className='h-3.5 w-3.5 text-[#004d19]' />
        <span className='text-[10px] font-bold uppercase tracking-widest text-[#4a5e4a]'>
          Biometrics
        </span>
      </div>
      {/* modalities */}
      <div className='px-4 py-3 space-y-2'>
        {modalities.map(({ icon, label, enrolled }) => (
          <div
            key={label}
            className='flex items-center justify-between bg-[#f5f7f5] border border-[#dce6dc] rounded-xl px-3 py-2'>
            <div className='flex items-center gap-2'>
              <div className='h-6 w-6 rounded-lg bg-white border border-[#dce6dc] flex items-center justify-center'>
                {icon}
              </div>
              <span className='text-[12px] font-medium text-[#0c190c]'>
                {label}
              </span>
            </div>
            {enrolled ? (
              <span className='text-[9.5px] font-bold text-[#166534] bg-[#dcfce7] border border-[#86efac] px-2 py-0.5 rounded-full'>
                ✓ Enrolled
              </span>
            ) : (
              <span className='text-[9.5px] font-bold text-[#475569] bg-[#f1f5f9] border border-[#cbd5e1] px-2 py-0.5 rounded-full'>
                Not enrolled
              </span>
            )}
          </div>
        ))}
        {/* assurance level row */}
        <div className='flex items-center justify-between bg-[#001a08] rounded-xl px-3 py-2 mt-1'>
          <span className='text-[10px] font-bold text-white/40 uppercase tracking-wide'>
            Assurance level
          </span>
          <LevelChip level={level} />
        </div>
      </div>
      {/* meta */}
      <div className='px-4 pb-4 space-y-1.5 border-t border-[#dce6dc] pt-3'>
        <div className='flex justify-between'>
          <span className='text-[10px] text-muted-foreground'>
            Last verified
          </span>
          <span className='text-[10.5px] font-semibold text-[#0c190c]'>
            {pensioner.lastVerifiedAt ? (
              format(new Date(pensioner.lastVerifiedAt), "d MMM yyyy")
            ) : (
              <span className='text-[#c2410c] font-bold'>Never</span>
            )}
          </span>
        </div>
        {(pensioner.missedVerificationCount ?? 0) > 0 && (
          <div className='flex justify-between'>
            <span className='text-[10px] text-muted-foreground'>
              Missed verifications
            </span>
            <span className='text-[10.5px] font-bold text-destructive'>
              {pensioner.missedVerificationCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
