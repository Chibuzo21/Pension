// components/onboarding/MdaCombobox.tsx
"use client";
import { useState, useRef } from "react";
import { abiaStateMDAs } from "@/lib/mdas";

function fuzzyFilter(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return abiaStateMDAs
    .map((m) => ({ m, match: m.toLowerCase().includes(q) }))
    .filter((x) => x.match)
    .slice(0, 8)
    .map((x) => x.m);
}

export function MdaCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const results = fuzzyFilter(query);

  function selectCustom() {
    setIsCustom(true);
    setOpen(false);
  }

  function confirmCustom() {
    if (query.trim()) {
      onChange(`Other — ${query.trim()}`);
      setIsCustom(false);
      setQuery("");
    }
  }

  if (isCustom) {
    return (
      <div className='flex gap-2'>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Type your MDA name exactly…'
          className='flex-1 h-9 px-3 rounded-lg border border-amber-400 bg-amber-50 text-[12px] outline-none'
        />
        <button
          type='button'
          onClick={confirmCustom}
          className='h-9 px-3 rounded-lg bg-[#001407] text-white text-[12px]'>
          Confirm
        </button>
        <button
          type='button'
          onClick={() => {
            setIsCustom(false);
            setQuery("");
          }}
          className='h-9 px-3 rounded-lg border text-[12px]'>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className='relative'>
      {value ? (
        <div className='flex items-center gap-2 h-9 px-3 rounded-lg border border-[#001407]/15 bg-white text-[12px]'>
          {value.startsWith("Other —") && (
            <span className='text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded'>
              Other
            </span>
          )}
          <span className='flex-1 truncate'>
            {value.replace("Other — ", "")}
          </span>
          <button
            type='button'
            onClick={() => {
              onChange("");
              setQuery("");
            }}>
            ×
          </button>
        </div>
      ) : (
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder='Search MDA…'
          className='w-full h-9 px-3 rounded-lg border border-[#001407]/15 bg-white text-[12px] outline-none focus:border-[#004d19]'
        />
      )}

      {open && (
        <ul className='absolute z-50 mt-1 w-full bg-white border border-[#001407]/15 rounded-lg shadow-sm max-h-52 overflow-y-auto'>
          {results.map((m) => (
            <li
              key={m}
              onMouseDown={() => {
                onChange(m);
                setQuery("");
                setOpen(false);
              }}
              className='px-3 py-2 text-[12px] cursor-pointer hover:bg-[#f0f7f2]'>
              {m}
            </li>
          ))}

          {/* Always show this at the bottom */}
          <li
            onMouseDown={selectCustom}
            className='px-3 py-2 text-[12px] cursor-pointer border-t border-[#001407]/8 text-amber-700 hover:bg-amber-50 flex items-center gap-2'>
            <span className='text-[10px] bg-amber-100 px-1.5 py-0.5 rounded'>
              Other
            </span>
            {query.trim()
              ? `"${query}" — not in list, enter manually`
              : "My MDA isn't listed"}
          </li>
        </ul>
      )}
    </div>
  );
}
