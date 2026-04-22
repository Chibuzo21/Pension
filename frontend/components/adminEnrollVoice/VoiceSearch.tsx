"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
    <div className='card mb-4'>
      <div className='ch'>
        <div className='ct'>Step 1 — Select Pensioner</div>
      </div>
      <div className='cb'>
        <input
          className='srch w-full'
          placeholder='🔍 Search by name or Pension ID…'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        <div className='mt-2.5 flex flex-col gap-2'>
          {searchResults?.map((p) => (
            <button
              key={p._id}
              onClick={() => onSelect(p._id)}
              type='button'
              className='flex items-center gap-5 p-2 rounded-md text-left border border-mist cursor-pointer hover:bg-mist transition-colors bg-offwhite'>
              <div className='flex items-center justify-center h-8 w-8 rounded-full bg-g1 text-white font-bold shrink-0'>
                {p.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div>
                <div className='font-bold'>{p.fullName}</div>
                <code className='text-g1'>{p.pensionId}</code>
              </div>
              <span
                className={`blvl l${p.biometricLevel?.slice(1) ?? "0"}`}
                style={{ marginLeft: "auto" }}>
                {p.biometricLevel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
