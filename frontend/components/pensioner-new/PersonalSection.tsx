"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PensionerFormValues } from "@/types/pensioner-new";
import FF from "./FF";

export default function PersonalSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PensionerFormValues>();

  return (
    <Card>
      <CardHeader className='pb-3 pt-4 px-4'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <User className='h-4 w-4 text-muted-foreground' />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='sm:col-span-2'>
          <FF label='Full Name' required error={errors.fullName?.message}>
            <Input
              placeholder='e.g. Chukwuemeka John Okafor'
              className={cn(errors.fullName && "border-destructive")}
              {...register("fullName", { required: "Full name is required" })}
            />
          </FF>
        </div>

        <FF label='Pension ID' required error={errors.pensionId?.message}>
          <Input
            placeholder='PEN-2024-00042'
            className={cn(
              "font-mono",
              errors.pensionId && "border-destructive",
            )}
            {...register("pensionId", { required: "Pension ID is required" })}
          />
        </FF>

        <FF label='Date of Birth' required error={errors.dob?.message}>
          <Input
            type='date'
            className={cn(errors.dob && "border-destructive")}
            {...register("dob", { required: "Date of birth is required" })}
          />
        </FF>

        <FF label='Email Address' error={errors.email?.message}>
          <Input
            type='email'
            placeholder='name@example.com'
            className={cn(errors.email && "border-destructive")}
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
        </FF>

        <FF label='Phone Number'>
          <Input placeholder='+234 800 000 0000' {...register("phone")} />
        </FF>

        <FF label='NIN (11 digits)' error={errors.nin?.message}>
          <Input
            placeholder='12345678901'
            maxLength={11}
            className={cn("font-mono", errors.nin && "border-destructive")}
            {...register("nin", {
              pattern: {
                value: /^\d{11}$/,
                message: "Must be exactly 11 digits",
              },
            })}
          />
        </FF>

        <FF label='BVN (11 digits)' error={errors.bvn?.message}>
          <Input
            placeholder='12345678901'
            maxLength={11}
            className={cn("font-mono", errors.bvn && "border-destructive")}
            {...register("bvn", {
              pattern: {
                value: /^\d{11}$/,
                message: "Must be exactly 11 digits",
              },
            })}
          />
        </FF>

        <div className='sm:col-span-2'>
          <FF label='Residential Address'>
            <Input
              placeholder='Full residential address'
              {...register("address")}
            />
          </FF>
        </div>
      </CardContent>
    </Card>
  );
}
