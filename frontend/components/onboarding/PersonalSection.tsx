// components/onboarding/PersonalSection.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { User } from "lucide-react";
import { FF, SectionHead, fi } from "./FormField";
import { RegistrationForm } from "./types";

export function PersonalSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegistrationForm>();

  return (
    <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5'>
      <SectionHead
        icon={User}
        title='Personal Information'
        subtitle='Your legal identity details'
      />
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='sm:col-span-2'>
          <FF label='Full Legal Name' required error={errors.fullName?.message}>
            <input
              placeholder='e.g. Chukwuemeka John Okafor'
              className={fi(!!errors.fullName)}
              {...register("fullName", { required: "Full name is required" })}
            />
          </FF>
        </div>
        <FF label='Date of Birth' required error={errors.dob?.message}>
          <input
            type='date'
            className={fi(!!errors.dob)}
            {...register("dob", { required: "Date of birth is required" })}
          />
        </FF>
        <FF label='NIN (11 digits)' required error={errors.nin?.message}>
          <input
            placeholder='12345678901'
            maxLength={11}
            className={fi(!!errors.nin) + " font-mono"}
            {...register("nin", {
              required: "NIN is required",
              pattern: {
                value: /^\d{11}$/,
                message: "Must be exactly 11 digits",
              },
            })}
          />
        </FF>
        <FF label='BVN (11 digits)' error={errors.bvn?.message}>
          <input
            placeholder='12345678901'
            maxLength={11}
            className={fi(!!errors.bvn) + " font-mono"}
            {...register("bvn", {
              pattern: {
                value: /^\d{11}$/,
                message: "Must be exactly 11 digits",
              },
            })}
          />
        </FF>
        <FF label='Email Address' error={errors.email?.message}>
          <input
            type='email'
            placeholder='name@example.com'
            className={fi(!!errors.email)}
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email",
              },
            })}
          />
        </FF>
        <FF label='Phone Number'>
          <input
            placeholder='08012345678'
            className={fi()}
            {...register("phone")}
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
    </div>
  );
}
