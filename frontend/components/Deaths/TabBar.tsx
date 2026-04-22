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
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--mist)",
        padding: "0 20px",
        display: "flex",
        gap: 0,
      }}>
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          style={{
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: activeTab === key ? 700 : 400,
            color: activeTab === key ? "var(--g1)" : "var(--muted)",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === key
                ? "2px solid var(--g1)"
                : "2px solid transparent",
            cursor: "pointer",
            fontFamily: "inherit",
          }}>
          {label({ pendingCount, dormantCount })}
        </button>
      ))}
    </div>
  );
}
