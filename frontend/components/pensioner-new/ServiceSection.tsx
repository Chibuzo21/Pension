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
import { Building } from "lucide-react";
import { PensionerFormValues, SUB_TREASURIES } from "@/types/pensioner-new";
import FF from "./FF";

export default function ServiceSection() {
  const { register, control } = useFormContext<PensionerFormValues>();

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Building className='h-4 w-4 text-muted-foreground' />
          Service Record
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='sm:col-span-2'>
          <FF label='Last MDA (Ministry / Department / Agency)'>
            <Input
              placeholder='e.g. Ministry of Finance, Abia State'
              {...register("lastMda")}
            />
          </FF>
        </div>
        <FF label='Last Rank'>
          <Input
            placeholder='e.g. Director, Chief Superintendent, etc.'
            {...register("lastRank")}
          />
        </FF>
        <FF label='Sub-Treasury / Station'>
          <Controller
            name='subTreasury'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select station...' />
                </SelectTrigger>
                <SelectContent className='bg-g1 text-white border-border p-2 rounded-lg shadow-lg'>
                  {SUB_TREASURIES.map((s) => (
                    <SelectItem key={s} value={s} className='hover:bg-white/10'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FF>

        <FF label='Date of Employment'>
          <Input type='date' {...register("dateOfEmployment")} />
        </FF>

        <FF label='Date of Retirement'>
          <Input type='date' {...register("dateOfRetirement")} />
        </FF>
      </CardContent>
    </Card>
  );
}
