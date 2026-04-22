"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import path from "path";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <main className=' h-screen flex-1 flex items-center justify-center flex-col p-6 relative overflow-hidden'>
      <span className='absolute text-[180px] font-black text-g1/5 leading-none select-none tracking-[-8px] pointer-events-none'>
        404
      </span>

      <div className='relative z-10 w-14 h-14 rounded-xl bg-white border border-mist shadow-sm flex items-center justify-center mb-4'>
        <svg
          width='26'
          height='26'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#c8960c'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <line x1='12' y1='16' x2='12.01' y2='16' />
        </svg>
      </div>

      <p className='relative z-10 text-[11px] font-bold text-gold tracking-[1.2px] uppercase mb-1.5'>
        Error 404
      </p>
      <h1 className='relative z-10 text-xl font-bold text-ink mb-2 text-center'>
        Page Not Found
      </h1>
      <p className='relative z-10 text-[11.5px] text-slate text-center max-w-xs leading-relaxed mb-5'>
        The resource you requested could not be located. It may have been moved,
        deleted, or the URL entered is incorrect.
      </p>

      <div className='relative z-10 bg-white border border-mist rounded-[7px] px-3 py-1 text-[10.5px] text-muted-foreground font-mono mb-5'>
        {pathname}
      </div>

      {/* Actions */}
      <div className='relative z-10 flex gap-2'>
        <Link href='/dashboard' className='btn-p text-[11.5px]! py-2! px-4!'>
          Go to Dashboard
        </Link>
        <button onClick={() => router.back()} className='btn-sm boutline'>
          Go Back
        </button>
      </div>

      {/* Footer chips */}
      <div className='relative z-10 flex gap-1.5 mt-4'>
        <span className='badge b-neutral'>BPMLVS v2.4</span>
        <span className='badge b-neutral'>Secure</span>
        <span className='badge b-ok'>Nigeria</span>
      </div>
    </main>
  );
}
