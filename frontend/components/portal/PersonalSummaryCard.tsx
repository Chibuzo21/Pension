import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn, statusBadge, biometricLevelBadge } from "@/lib/utils";
import { User } from "lucide-react";

// ---------------------------------------------------------------------------
// InfoRow — reusable label + value cell
// ---------------------------------------------------------------------------
interface InfoRowProps {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}

export function InfoRow({ label, value, children }: InfoRowProps) {
  return (
    <div>
      <p className='text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground) mb-0.5'>
        {label}
      </p>
      {children ?? <p className='text-sm'>{value ?? "—"}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PersonalSummaryCard
// ---------------------------------------------------------------------------
interface Pensioner {
  fullName: string;
  dob?: string | null;
  lastMda?: string | null;
  subTreasury?: string | null;
  status: string;
  biometricLevel: string;
}

interface Props {
  pensioner: Pensioner;
}

export function PersonalSummaryCard({ pensioner }: Props) {
  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <User className='h-4 w-4 text-(--muted-foreground)' />
          My Information
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <InfoRow label='Full Name' value={pensioner.fullName} />
          <InfoRow
            label='Date of Birth'
            value={
              pensioner.dob
                ? format(new Date(pensioner.dob), "dd MMM yyyy")
                : undefined
            }
          />
          <InfoRow label='MDA' value={pensioner.lastMda} />
          <InfoRow label='Sub-Treasury' value={pensioner.subTreasury} />
          <InfoRow label='Status'>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                statusBadge(pensioner.status),
              )}>
              {pensioner.status}
            </span>
          </InfoRow>
          <InfoRow label='Biometric Level'>
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-md border",
                biometricLevelBadge(pensioner.biometricLevel),
              )}>
              {pensioner.biometricLevel}
            </span>
          </InfoRow>
        </div>
      </CardContent>
    </Card>
  );
}
