import Link from "next/link";
import { Button } from "../ui/button";
import { Calculator, Play } from "lucide-react";

export function CTAButtons() {
  return (
    <div className='flex gap-2.5 flex-wrap justify-center mb-7'>
      <Link href='/roi'>
        <Button className='bg-[#c8960c] hover:bg-[#e6ad0e] text-black font-bold text-[13px] px-7 py-3 h-auto rounded-lg transition-all hover:-translate-y-px'>
          <Calculator size={15} className='mr-2' />
          Calculate ROI
        </Button>
      </Link>
      <Link href='/dashboard/portal/verify'>
        <Button
          variant='outline'
          className='bg-transparent border border-white/20 text-white/75 font-semibold text-[13px] px-7 py-3 h-auto rounded-lg hover:bg-white/[0.07] hover:text-white hover:border-white'>
          <Play size={14} className='mr-2' />
          Live Demo
        </Button>
      </Link>
    </div>
  );
}
