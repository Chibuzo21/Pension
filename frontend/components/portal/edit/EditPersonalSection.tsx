"use client";

import { useFormContext } from "react-hook-form";
import { User } from "lucide-react";
import { FF, fi, SectionCard } from "./FormPrimitives";

export function EditPersonalSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <SectionCard
      icon={User}
      title='Contact Details'
      subtitle='Phone, email, and residential address'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <FF label='Phone Number' error={errors.phone?.message as string}>
          <input
            placeholder='08012345678'
            className={fi(!!errors.phone)}
            {...register("phone")}
          />
        </FF>
        <FF label='Email Address' error={errors.email?.message as string}>
          <input
            type='email'
            placeholder='name@example.com'
            className={fi(!!errors.email)}
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
        </FF>
        <div className='sm:col-span-2'>
          <FF label='Residential Address'>
            <input
              placeholder='Full residential address'
              className={fi()}
              {...register("address")}
            />
          </FF>
        </div>
      </div>
    </SectionCard>
  );
}
