type Status = "pending" | "approved" | "rejected" | "deceased";

interface StatusBadgeProps {
  status: Status;
}

const config: Record<Status, { bg: string; color: string; label: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E", label: "PENDING" },
  approved: { bg: "#D1FAE5", color: "#065F46", label: "APPROVED" },
  rejected: { bg: "#FEE2E2", color: "#991B1B", label: "REJECTED" },
  deceased: { bg: "#FEE2E2", color: "#991B1B", label: "DECEASED" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, color, label } = config[status] ?? config.pending;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 6,
        background: bg,
        color,
      }}>
      {label}
    </span>
  );
}
