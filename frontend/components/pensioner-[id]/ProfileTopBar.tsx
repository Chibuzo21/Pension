import Link from "next/link";
import { ArrowLeft, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill, LevelChip } from "./ui-primitives";
import { PensionerStatus } from "@/types/pensioner";

interface ProfileTopBarProps {
  pensionerId: string;
  fullName: string;
  status: PensionerStatus;
  level: string;
  isDeceased: boolean;
}

export function ProfileTopBar({
  pensionerId,
  fullName,
  status,
  level,
  isDeceased,
}: ProfileTopBarProps) {
  return (
    <div className='sticky top-0 z-20 bg-[#001a08] border-b-2 border-[#c8960c]'>
      <div className='max-w-5xl mx-auto px-5 h-14 flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0 rounded-lg text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
          asChild>
          <Link href='/dashboard/admin/pensioners'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>

        <div className='flex-1 min-w-0 flex items-center gap-2 flex-wrap'>
          <h1 className='text-[13px] font-bold text-white truncate'>
            {fullName}
          </h1>
          <StatusPill status={status} />
          <LevelChip level={level} />
        </div>

        {!isDeceased && (
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='text-xs h-8 gap-1.5 hidden sm:inline-flex bg-transparent border-[#c8960c]/40 text-[#c8960c] hover:bg-[#c8960c]/10 hover:text-[#e6ad0e] hover:border-[#c8960c]'>
              <Link href={`/dashboard/admin/pensioners/${pensionerId}/enroll`}>
                <Camera className='h-3.5 w-3.5' /> Enrol Face
              </Link>
            </Button>
            <Button
              variant='outline'
              size='sm'
              asChild
              className='text-xs h-8 gap-1.5 hidden sm:inline-flex bg-transparent border-[#c8960c]/40 text-[#c8960c] hover:bg-[#c8960c]/10 hover:text-[#e6ad0e] hover:border-[#c8960c]'>
              <Link href={`/dashboard/admin/pensioners/${pensionerId}/enroll`}>
                <Mic className='h-3.5 w-3.5' /> Enrol Voice
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
