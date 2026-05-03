// components/onboarding/DeceasedSection.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FF, SectionHead, fi } from "./FormField";
import { RegistrationForm } from "./types";

export function DeceasedSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegistrationForm>();

  const isDeceased = watch("isDeceased");

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5 transition-colors",
        isDeceased ? "border-red-200 bg-red-50/40" : "border-[#001407]/8",
      )}>
      <SectionHead
        icon={AlertTriangle}
        title='Deceased Registration'
        subtitle='Only complete this if you are registering on behalf of a late pensioner'
      />

      {/* Toggle */}
      <label className='flex items-start gap-3 cursor-pointer group'>
        <div className='relative mt-0.5 shrink-0'>
          <input
            type='checkbox'
            className='sr-only peer'
            {...register("isDeceased")}
          />
          <div
            className={cn(
              "w-9 h-5 rounded-full transition-colors",
              "peer-checked:bg-red-500 bg-[#001407]/15",
              "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
              "after:bg-white after:rounded-full after:h-4 after:w-4",
              "after:transition-transform peer-checked:after:translate-x-4",
            )}
          />
        </div>
        <div>
          <p className='text-[12px] font-semibold text-[#0c190c]'>
            This pensioner is deceased
          </p>
          <p className='text-[11px] text-[#0c190c]/45 mt-0.5'>
            I am a family member or representative registering on their behalf
          </p>
        </div>
      </label>

      {/* Conditional fields */}
      {isDeceased && (
        <div className='mt-4 pt-4 border-t border-red-100 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='sm:col-span-2 p-3 rounded-lg bg-red-50 border border-red-100'>
            <p className='text-[11px] text-red-700 leading-relaxed'>
              <strong>Important:</strong> Completing this section will flag the
              account as pending death claim review. The pension officer will
              verify the information before marking the account deceased. All
              payments will be paused pending review.
            </p>
          </div>

          <FF label='Date of Death' error={errors.dateOfDeath?.message}>
            <input
              type='date'
              className={fi(!!errors.dateOfDeath)}
              max={new Date().toISOString().split("T")[0]}
              {...register("dateOfDeath")}
            />
          </FF>

          <FF
            label='Relationship to Deceased'
            error={errors.registrantRelationship?.message}>
            <input
              placeholder='e.g. Son, Daughter, Spouse'
              className={fi(!!errors.registrantRelationship)}
              {...register("registrantRelationship", {
                validate: (v) =>
                  !watch("isDeceased") ||
                  !!v?.trim() ||
                  "Please state your relationship",
              })}
            />
          </FF>

          <FF label='Your Full Name' error={errors.registrantName?.message}>
            <input
              placeholder='Your legal full name'
              className={fi(!!errors.registrantName)}
              {...register("registrantName", {
                validate: (v) =>
                  !watch("isDeceased") ||
                  !!v?.trim() ||
                  "Your name is required",
              })}
            />
          </FF>

          <FF label='Your Phone Number' error={errors.registrantPhone?.message}>
            <input
              placeholder='08012345678'
              className={fi(!!errors.registrantPhone)}
              {...register("registrantPhone", {
                validate: (v) =>
                  !watch("isDeceased") ||
                  !!v?.trim() ||
                  "Your phone number is required",
              })}
            />
          </FF>

          <div className='sm:col-span-2'>
            <FF label='Death Certificate (optional at this stage)'>
              <input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='w-full text-[12px] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer'
                {...register("deathCertificateFile")}
              />
              <p className='text-[10px] text-[#001407]/35 mt-1'>
                You can upload this later. A pension officer will contact you to
                verify.
              </p>
            </FF>
          </div>
        </div>
      )}
    </div>
  );
}
