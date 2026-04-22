"use client";

import { usePensionerProfile } from "@/lib/usePensionerProfile";
import { usePensioner, Tab } from "./context/PensionerContext";
import { cn } from "@/lib/utils";

const TABS: { key: Tab; label: (count: number) => string }[] = [
  { key: "details", label: () => "📋 Details" },
  { key: "verifications", label: (n) => `🔐 Verifications (${n})` },
  { key: "documents", label: () => "📄 Documents" },
  { key: "nok", label: () => "👥 Next of Kin" },
];

export function PensionerTabs() {
  const { tab, setTab, id } = usePensioner();
  const { verifications } = usePensionerProfile(id);
  const verCount = verifications.length;

  return (
    <div className='mb-3.5 flex w-fit gap-0.5 rounded-[9px] bg-muted p-1'>
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={cn(
            "rounded-[7px] px-3 py-1.25 text-[11px] font-semibold transition-all duration-150 cursor-pointer font-[inherit]",
            tab === key
              ? "bg-white text-foreground shadow-[0_1px_4px_rgba(0,50,0,0.1)]"
              : "bg-transparent text-muted-foreground hover:text-foreground",
          )}>
          {label(verCount)}
        </button>
      ))}
    </div>
  );
}
