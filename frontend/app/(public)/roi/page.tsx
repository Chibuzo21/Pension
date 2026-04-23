"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ROIPage() {
  const [numPensioners, setNumPensioners] = useState(25000);
  const [ghostRate, setGhostRate] = useState(20);
  const [avgPension, setAvgPension] = useState(45000);

  const calculateROI = () => {
    const ghosts = Math.floor(numPensioners * (ghostRate / 100));
    const annualFraud = ghosts * avgPension * 12;
    const monthlySavings = ghosts * avgPension;
    const systemCost = 120000000;
    const netSavings = annualFraud - systemCost;

    return {
      ghosts,
      monthlySavings,
      annualFraud,
      netSavings,
      roi: netSavings > 0 ? ((netSavings / systemCost) * 100).toFixed(1) : "0",
    };
  };

  const roi = calculateROI();

  return (
    <div className='min-h-screen bg-g3 text-white pb-20'>
      {/* Header */}
      <div className='bg-black/18 border-b border-white/8 px-11 py-3.5'>
        <div className='text-xs font-bold uppercase text-white/40'>
          ROI Calculator
        </div>
      </div>

      {/* Main content */}
      <div className='md:px-11 px-6 py-9 max-w-5xl mx-auto'>
        <h1 className='text-4xl font-bold mb-2'>
          Your State's{" "}
          <em className='text-gold2 not-italic'>Return on Investment</em>
        </h1>
        <p className='text-base text-white/50 mb-12'>
          Adjust sliders to model your state's pension landscape
        </p>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Sliders */}
          <div className='bg-white/6 border border-white/8 rounded-xl p-6'>
            <div className='text-sm font-bold text-gold2 uppercase mb-5'>
              📊 State Parameters
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>
                Number of Active Pensioners
              </label>
              <input
                type='range'
                min='5000'
                max='100000'
                step='1000'
                value={numPensioners}
                onChange={(e) => setNumPensioners(Number(e.target.value))}
                className='w-full'
              />
              <div className='text-xl font-bold text-gold2 mt-2'>
                {numPensioners.toLocaleString()}
              </div>
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>
                Estimated Ghost Pensioner Rate (%)
              </label>
              <input
                type='range'
                min='5'
                max='40'
                step='1'
                value={ghostRate}
                onChange={(e) => setGhostRate(Number(e.target.value))}
                className='w-full'
              />
              <div className='text-xl font-bold text-gold2 mt-2'>
                {ghostRate}%
              </div>
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>
                Average Monthly Pension (₦)
              </label>
              <input
                type='range'
                min='20000'
                max='120000'
                step='5000'
                value={avgPension}
                onChange={(e) => setAvgPension(Number(e.target.value))}
                className='w-full'
              />
              <div className='text-xl font-bold text-gold2 mt-2'>
                ₦{avgPension.toLocaleString()}
              </div>
            </div>

            <div className='bg-white/6 border border-(--gold)/30 rounded-lg p-3 text-xs text-white/36 mt-6'>
              💡 BPMLVS v2.0 flat fee:{" "}
              <span className='text-gold2 font-bold'>₦120M/year</span> —
              unlimited verifications, all 3 modalities.
            </div>
          </div>

          {/* Results */}
          <div className='flex flex-col gap-4'>
            <div className='bg-gold/18 border border-(--gold)/30 rounded-xl p-8 text-center flex-1 flex flex-col justify-center'>
              <div className='text-xs font-bold text-gold2 uppercase mb-2'>
                ⚡ Year-1 Net Savings
              </div>
              <div className='text-5xl font-bold text-gold2 mb-2'>
                {roi.netSavings > 0
                  ? `₦${(roi.netSavings / 1_000_000).toFixed(0)}M`
                  : "Not profitable at these inputs"}
              </div>
              <div className='text-sm text-white/50'>
                per year from ghost elimination
              </div>
              <div className='text-xs text-gold2 font-bold mt-4'>
                ROI: {roi.roi}%
              </div>
            </div>

            <div className='bg-white/7 border border-white/8 rounded-xl p-5'>
              <div className='text-xs font-bold text-gold2 uppercase mb-4'>
                ROI Summary
              </div>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-white/50'>Ghosts eliminated</span>
                  <span className='font-bold text-gold2'>
                    {roi.ghosts.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between border-t border-white/8 pt-3'>
                  <span className='text-white/50'>Monthly savings</span>
                  <span className='font-bold text-gold2'>
                    ₦{(roi.monthlySavings / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className='flex justify-between border-t border-white/8 pt-3'>
                  <span className='text-white/50'>Annual fraud recovery</span>
                  <span className='font-bold text-gold2'>
                    ₦{(roi.annualFraud / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
            </div>
            <div className='flex gap-3 flex-wrap justify-center mb-5'>
              <Link href='/partner'>
                <Button className='bg-[#c8960c] hover:bg-[#e6ad0e] text-black font-bold px-6 py-3 h-auto text-[13px] rounded-lg transition-all hover:-translate-y-px shadow-lg shadow-[#c8960c]/20'>
                  🤝 Partner
                </Button>
              </Link>
              <Link href='/crisis'>
                <Button
                  variant='outline'
                  className='bg-transparent border border-white/20 text-white/75 hover:bg-white/[0.07] hover:text-white hover:border-white font-semibold px-6 py-3 h-auto text-[13px] rounded-lg'>
                  📊 Crisis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
