import { Card, CardContent } from "../ui/card";

export default function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='text-2xl font-bold mt-0.5 tabular-nums'>{value}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>{sub}</p>
          </div>
          <div className='p-2 rounded-lg bg-muted shrink-0'>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
