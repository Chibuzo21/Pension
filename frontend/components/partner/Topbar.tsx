import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function Topbar({ onBack }: { onBack?: () => void }) {
  return (
    <header className='bg-black/18 border-b border-white/8 px-11 py-3.5 flex items-center justify-between'>
      <div className='flex items-center gap-2.5'>
        <span className='text-lg'>🇳🇬</span>
        <span className='text-white/40 text-[9px] font-bold tracking-[1.6px] uppercase'>
          BPMLVS v2.0
        </span>
      </div>
      <Button
        size='sm'
        variant='outline'
        onClick={onBack}
        className='h-7 text-[11px] px-3 bg-transparent border border-white/20 text-white/70 hover:bg-white/[0.07] hover:text-white hover:border-white'>
        <ArrowLeft size={11} className='mr-1' />
        Overview
      </Button>
    </header>
  );
}
