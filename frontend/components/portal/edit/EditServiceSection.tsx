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
import { SUB_TREASURIES } from "@/types/pensioner-new";
import { FF, fi, SectionCard } from "./FormPrimitives";

export function EditServiceSection() {
  const { register, control } = useFormContext();

  return (
    <SectionCard
      icon={Building}
      title='Service Record'
      subtitle='MDA, station and employment dates'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='sm:col-span-2'>
          <FF label='Last MDA (Ministry / Department / Agency)'>
            <input
              placeholder='e.g. Ministry of Finance, Abia State'
              className={fi()}
              {...register("lastMda")}
            />
          </FF>
        </div>
        <FF label='Last Rank'>
          <input
            placeholder='e.g. Director, Chief Superintendent, etc.'
            className={fi()}
            {...register("lastRank")}
          />
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
      </div>
    </SectionCard>
  );
}
