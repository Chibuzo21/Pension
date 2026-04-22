interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className='card' style={{ textAlign: "center", padding: "32px 20px" }}>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>{message}</p>
    </div>
  );
}
