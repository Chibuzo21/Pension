// components/onboarding/BankingSection.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FF, SectionHead, fi } from "./FormField";
import { BANKS } from "@/types/pensioner-new";
import { RegistrationForm } from "./types";

export function BankingSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegistrationForm>();

  return (
    <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5'>
      <SectionHead
        icon={CreditCard}
        title='Banking Details'
        subtitle='Where your pension payments are received'
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <FF label='Pension Bank'>
          <Controller
            name='bankName'
            control={control}
            render={({ field: fl }) => (
              <Select value={fl.value} onValueChange={fl.onChange}>
                <SelectTrigger className='h-9 text-[12px] border border-[#001407]/15 bg-white'>
                  <SelectValue placeholder='Select bank…' />
                </SelectTrigger>
                <SelectContent className='bg-[#001407] text-white border-border rounded-lg'>
                  {BANKS.map((b) => (
                    <SelectItem
                      key={b}
                      value={b}
                      className='text-[12px] hover:bg-white/10'>
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
          <input
            placeholder='0123456789'
            maxLength={10}
            className={fi(!!errors.accountNumber) + " font-mono"}
            {...register("accountNumber", {
              pattern: {
                value: /^\d{10}$/,
                message: "Must be exactly 10 digits",
              },
            })}
          />
        </FF>
      </div>
    </div>
  );
}
