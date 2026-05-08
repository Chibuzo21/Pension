// components/onboarding/ServiceSection.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FF, SectionHead, fi } from "./FormField";
import { SUB_TREASURIES } from "@/types/pensioner-new";
import { RegistrationForm } from "./types";
import { MdaCombobox } from "./MdaCombobox";

export function ServiceSection() {
  const { register, control } = useFormContext<RegistrationForm>();

  return (
    <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5'>
      <SectionHead
        icon={Building}
        title='Service Record'
        subtitle='Your employment and retirement details'
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='sm:col-span-2'>
          <FF label='Last MDA (Ministry / Department / Agency)'>
            <Controller
              name='lastMda'
              control={control}
              render={({ field }) => (
                <MdaCombobox
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </FF>
        </div>
        <FF label='Last Rank'>
          <input type='text' className={fi()} {...register("lastRank")} />
        </FF>
        <FF label='Sub-Treasury / Station'>
          <Controller
            name='subTreasury'
            control={control}
            render={({ field: fl }) => (
              <Select value={fl.value} onValueChange={fl.onChange}>
                <SelectTrigger className='h-9 text-[12px] border border-[#001407]/15 bg-white'>
                  <SelectValue placeholder='Select station…' />
                </SelectTrigger>
                <SelectContent className='bg-[#001407] text-white border-border rounded-lg'>
                  {SUB_TREASURIES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className='text-[12px] hover:bg-white/10'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FF>
        <FF label='Date of Employment'>
          <input
            type='date'
            className={fi()}
            {...register("dateOfEmployment")}
          />
        </FF>
        <FF label='Date of Retirement'>
          <input
            type='date'
            className={fi()}
            {...register("dateOfRetirement")}
          />
        </FF>
        <FF label='Total Gratuity (₦)'>
          <input
            placeholder='e.g. 5000000'
            className={fi()}
            {...register("gratuityAmount")}
          />
        </FF>
        <FF label='Gratuity Paid (₦)'>
          <input
            placeholder='e.g. 2500000'
            className={fi()}
            {...register("gratuityPaid")}
          />
        </FF>
      </div>
    </div>
  );
}
