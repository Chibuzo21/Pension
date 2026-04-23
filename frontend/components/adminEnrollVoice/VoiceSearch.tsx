"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const LEVEL_STYLE: Record<string, string> = {
  L1: "bg-[#f0fdfa] text-[var(--teal)]",
  L2: "bg-[#faf5ff] text-[var(--purple)]",
  L3: "bg-[#f0fdf4] text-[#166534]",
};

interface VoiceSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: Id<"pensioners">) => void;
}

export function VoiceSearch({
  search,
  onSearchChange,
  onSelect,
}: VoiceSearchProps) {
  const searchResults = useQuery(
    api.pensioners.search,
    search.length > 1 ? { query: search } : "skip",
  );

  return (
    <div className='bg-white border border-mist rounded-[11px] shadow-[0_1px_5px_rgba(0,50,0,0.07)] overflow-hidden mb-4'>
      {/* Card header */}
      <div className='px-4 py-2.5 border-b border-smoke'>
        <p className='text-[11.5px] font-bold text-ink'>
          Step 1 — Select Pensioner
        </p>
      </div>

      {/* Card body */}
      <div className='p-4'>
        <input
          className='w-full border-[1.5px] border-mist focus:border-g1 rounded-[7px] px-3 py-2 text-[11.5px] font-[inherit] outline-none transition-colors duration-150 bg-white placeholder:text-slate'
          placeholder='🔍 Search by name or Pension ID…'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />

        {searchResults && searchResults.length > 0 && (
          <div className='mt-2.5 flex flex-col gap-1.5'>
            {searchResults.map((p) => (
              <button
                key={p._id}
                onClick={() => onSelect(p._id)}
                type='button'
                className='flex items-center gap-3 p-2.5 rounded-[9px] text-left border border-mist bg-offwhite hover:bg-[#f0faf0] hover:border-g1 transition-all duration-150 cursor-pointer'>
                {/* Avatar */}
                <div className='w-8 h-8 rounded-full bg-g1 text-white text-[10px] font-bold flex items-center justify-center shrink-0'>
                  {p.fullName
                    .split(" ")
                    .slice(0, 2)
                    .map((n: string) => n[0])
                    .join("")}
                </div>

                {/* Name + ID */}
                <div className='flex-1 min-w-0'>
                  <p className='text-[12px] font-bold text-ink truncate'>
                    {p.fullName}
                  </p>
                  <code className='text-[10px] text-g1 font-mono'>
                    {p.pensionId}
                  </code>
                </div>

                {/* Bio level badge */}
                {p.biometricLevel && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${LEVEL_STYLE[p.biometricLevel] ?? "bg-[#f1f5f9] text-[#475569]"}`}>
                    {p.biometricLevel}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
