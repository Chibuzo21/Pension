import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Clock, AlertTriangle, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PensionerStatus, StatusAction } from "@/types/pensioner";
import { Doc } from "@/convex/_generated/dataModel";

interface StatusBannersProps {
  status: PensionerStatus;
  pensioner: Doc<"pensioners">;
  onOpenStatus: (action: StatusAction) => void;
}

const bannerBase =
  "rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 mb-5";
const iconBase = "h-8 w-8 rounded-lg flex items-center justify-center shrink-0";

export function StatusBanners({
  status,
  pensioner,
  onOpenStatus,
}: StatusBannersProps) {
  const router = useRouter();

  if (status === "dormant")
    return (
      <div className={`${bannerBase} bg-[#fef3c7] border border-[#fcd34d]`}>
        <div className={`${iconBase} bg-[#fde68a]`}>
          <Clock className='h-4 w-4 text-[#92400e]' />
        </div>
        <p className='text-[12px] text-[#78350f] flex-1 leading-relaxed'>
          <strong className='font-bold text-[#451a03]'>Dormant —</strong> Missed{" "}
          <strong>{pensioner.missedVerificationCount ?? 0}</strong> consecutive
          monthly verification
          {(pensioner.missedVerificationCount ?? 0) !== 1 ? "s" : ""}.
          Investigation required.
        </p>
        <div className='flex gap-2 shrink-0 flex-wrap'>
          <Button
            size='sm'
            variant='outline'
            className='text-[11px] h-7 border-[#fcd34d] text-[#92400e] bg-transparent hover:bg-[#fef9c3]'
            onClick={() => onOpenStatus("reinstate")}>
            Reinstate
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='text-[11px] h-7 border-[#fcd34d] text-[#92400e] bg-transparent hover:bg-[#fef9c3]'
            onClick={() => onOpenStatus("incapacitated")}>
            Incapacitated
          </Button>
          <Button
            size='sm'
            className='text-[11px] h-7 bg-[#b91c1c] hover:bg-[#991b1b] text-white border-0'
            onClick={() => onOpenStatus("deceased")}>
            Mark Deceased
          </Button>
        </div>
      </div>
    );

  if (status === "suspended")
    return (
      <div className={`${bannerBase} bg-[#fff7ed] border border-[#fdba74]`}>
        <div className={`${iconBase} bg-[#fed7aa]`}>
          <AlertTriangle className='h-4 w-4 text-[#c2410c]' />
        </div>
        <div className='flex-1 text-[12px] text-[#9a3412] leading-relaxed'>
          <strong className='font-bold text-[#7c2d12]'>Suspended —</strong>{" "}
          Payments are paused. A death claim may be pending senior officer
          review.
        </div>
        <Button
          size='sm'
          variant='outline'
          className='text-[11px] h-7 shrink-0 border-[#fdba74] text-[#c2410c] bg-transparent hover:bg-[#fff7ed]'
          onClick={() => router.push("/dashboard/admin/deaths")}>
          View Claim →
        </Button>
      </div>
    );

  if (status === "incapacitated")
    return (
      <div className={`${bannerBase} bg-[#eff6ff] border border-[#bfdbfe]`}>
        <div className={`${iconBase} bg-[#dbeafe]`}>
          <ShieldAlert className='h-4 w-4 text-[#1d4ed8]' />
        </div>
        <div className='flex-1 text-[12px] text-[#1e40af] leading-relaxed'>
          <strong className='font-bold text-[#1e3a8a]'>Incapacitated —</strong>{" "}
          {pensioner.incapacitationReason ?? "Reason not recorded."}
        </div>
        <Button
          size='sm'
          variant='outline'
          className='text-[11px] h-7 shrink-0 border-[#bfdbfe] text-[#1d4ed8] bg-transparent hover:bg-[#eff6ff]'
          onClick={() => onOpenStatus("reinstate")}>
          Reinstate
        </Button>
      </div>
    );

  if (status === "deceased")
    return (
      <div className={`${bannerBase} bg-[#fee2e2] border border-[#fca5a5]`}>
        <div className={`${iconBase} bg-[#fecaca]`}>
          <XCircle className='h-4 w-4 text-[#991b1b]' />
        </div>
        <p className='text-[12px] text-[#7f1d1d] leading-relaxed'>
          <strong className='font-bold text-[#450a0a]'>Deceased —</strong>{" "}
          Confirmed{" "}
          {pensioner.deathConfirmedAt
            ? format(new Date(pensioner.deathConfirmedAt), "d MMM yyyy")
            : ""}
          {pensioner.dateOfDeath
            ? `. Date of death: ${pensioner.dateOfDeath}`
            : ""}
          . All payments permanently stopped.
        </p>
      </div>
    );

  return null;
}
