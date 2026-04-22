"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PensionerFormValues, BANKS } from "@/types/pensioner-new";
import FF from "./FF";

export default function FinancialSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<PensionerFormValues>();

  const gratuityAmount = watch("gratuityAmount") ?? 0;
  const gratuityPaid = watch("gratuityPaid") ?? 0;
  const balance = Number(gratuityAmount) - Number(gratuityPaid);

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <CreditCard className='h-4 w-4 text-muted-foreground' />
          Financial Details
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <FF label='Current Pension Bank'>
          <Controller
            name='bankName'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select bank...' />
                </SelectTrigger>
                <SelectContent className='bg-g1 text-white border-border p-2 rounded-lg shadow-lg'>
                  {BANKS.map((b) => (
                    <SelectItem key={b} value={b} className='hover:bg-white/10'>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FF>

        <FF
          label='Account Number (NUBAN)'
          error={errors.accountNumber?.message}>
          <Input
            placeholder='0123456789'
            maxLength={10}
            className={cn(
              "font-mono",
              errors.accountNumber && "border-destructive",
            )}
            {...register("accountNumber", {
              pattern: {
                value: /^\d{10}$/,
                message: "Must be exactly 10 digits",
              },
            })}
          />
        </FF>

        <FF label='Total Gratuity (₦)'>
          <Input
            type='number'
            min={0}
            step={0.01}
            {...register("gratuityAmount", { valueAsNumber: true })}
          />
        </FF>

        <FF label='Gratuity Paid (₦)'>
          <Input
            type='number'
            min={0}
            step={0.01}
            {...register("gratuityPaid", { valueAsNumber: true })}
          />
        </FF>

        <div className='sm:col-span-2 flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg text-sm'>
          <span className='text-muted-foreground'>Gratuity Balance:</span>
          <span className='font-bold text-primary ml-1'>
            ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </span>
          <span className='text-xs text-muted-foreground'>(auto-computed)</span>
        </div>
      </CardContent>
    </Card>
  );
}
