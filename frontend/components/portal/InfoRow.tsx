export default function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className='text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground) mb-0.5'>
        {label}
      </p>
      {children ?? <p className='text-sm'>{value ?? "—"}</p>}
    </div>
  );
}
