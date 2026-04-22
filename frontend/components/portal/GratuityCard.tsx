import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface Pensioner {
  gratuityAmount: number;
  gratuityPaid: number;
  bankName?: string | null;
  accountNumber?: string | null;
}

interface Props {
  pensioner: Pensioner;
}

export function GratuityCard({ pensioner }: Props) {
  const balance = pensioner.gratuityAmount - pensioner.gratuityPaid;

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <CreditCard className='h-4 w-4 text-(--muted-foreground)' />
          Gratuity Summary
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='grid grid-cols-3 gap-3 text-center'>
          <div className='p-3 bg-(--muted)/40 rounded-xl'>
            <p className='text-[10px] text-(--muted-foreground) uppercase font-semibold'>
              Total
            </p>
            <p className='text-sm font-bold mt-1 tabular-nums'>
              {formatNaira(pensioner.gratuityAmount)}
            </p>
          </div>
          <div className='p-3 bg-(--muted)/40 rounded-xl'>
            <p className='text-[10px] text-(--muted-foreground) uppercase font-semibold'>
              Paid
            </p>
            <p className='text-sm font-bold mt-1 tabular-nums'>
              {formatNaira(pensioner.gratuityPaid)}
            </p>
          </div>
          <div className='p-3 bg-emerald-50 rounded-xl border border-emerald-100'>
            <p className='text-[10px] text-emerald-600 uppercase font-semibold'>
              Balance
            </p>
            <p className='text-sm font-bold text-emerald-700 mt-1 tabular-nums'>
              {formatNaira(balance)}
            </p>
          </div>
        </div>
        {pensioner.bankName && (
          <p className='text-xs text-(--muted-foreground) mt-3 text-center'>
            {pensioner.bankName} · {pensioner.accountNumber ?? "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
