import { cn } from "@/lib/utils";

export type Tab = "claims" | "dormant" | "deceased";

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingCount: number;
  dormantCount: number;
}

const TABS: {
  key: Tab;
  label: (counts: { pendingCount: number; dormantCount: number }) => string;
}[] = [
  {
    key: "claims",
    label: ({ pendingCount }) =>
      pendingCount > 0 ? `Death Claims (${pendingCount})` : "Death Claims",
  },
  {
    key: "dormant",
    label: ({ dormantCount }) =>
      dormantCount > 0 ? `Dormant (${dormantCount})` : "Dormant",
  },
  {
    key: "deceased",
    label: () => "Deceased Records",
  },
];

export function TabBar({
  activeTab,
  onTabChange,
  pendingCount,
  dormantCount,
}: TabBarProps) {
  return (
    <div className='bg-white border-b border-border overflow-x-auto scrollbar-none'>
      <div className='flex min-w-max px-4 sm:px-5'>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs whitespace-nowrap font-medium border-b-2 transition-colors cursor-pointer bg-transparent",
              activeTab === key
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}>
            {label({ pendingCount, dormantCount })}
          </button>
        ))}
      </div>
    </div>
  );
}
