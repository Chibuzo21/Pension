"use client";

import { useForm, Controller } from "react-hook-form";
import { ChevronRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/report-death/FormField";
import { FileUpload } from "@/components/report-death/FileUpload";

export interface DetailsFormValues {
  dateOfDeath: string;
  notes: string;
  file: File | null;
}

interface DetailsStepProps {
  onSubmit: (data: DetailsFormValues) => Promise<void>;
  onBack: () => void;
  submitting: boolean;
}

export function DetailsStep({
  onSubmit,
  onBack,
  submitting,
}: DetailsStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    defaultValues: { dateOfDeath: "", notes: "", file: null },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
      {/* Date of death */}
      <FormField
        label='Date of Death'
        required
        error={errors.dateOfDeath?.message}>
        <input
          type='date'
          max={new Date().toISOString().split("T")[0]}
          aria-invalid={!!errors.dateOfDeath}
          {...register("dateOfDeath", {
            required: "Please enter the date of death",
          })}
          className='w-full h-9 text-[12px] border border-[#001407]/15 bg-white rounded-lg px-3
                     focus:outline-none focus:ring-1 focus:ring-[#004d19]/40
                     focus:border-[#004d19]/50 transition-all'
        />
      </FormField>

      {/* Death certificate upload */}
      <div className='space-y-1.5'>
        <Label className='text-[11px] font-semibold text-[#2a3a2a] tracking-wide uppercase'>
          Death Certificate
        </Label>
        <Controller
          name='file'
          control={control}
          render={({ field }) => (
            <FileUpload
              file={field.value}
              onChange={field.onChange}
              hint='PDF, JPG or PNG · Optional now'
            />
          )}
        />
        <p className='text-[10px] text-[#001407]/35'>
          You can submit without a certificate — an officer will contact you to
          collect it.
        </p>
      </div>

      {/* Notes */}
      <FormField label='Additional notes (optional)'>
        <Textarea
          {...register("notes")}
          placeholder='Cause of death, hospital name, or any other relevant information…'
          className='text-[12px] resize-none min-h-20 border-[#001407]/15'
        />
      </FormField>

      {/* Disclaimer */}
      <div className='p-3 rounded-lg bg-[#001407]/4 border border-[#001407]/8'>
        <div className='flex gap-2 text-[11px] text-[#001407]/60'>
          <Shield className='w-3.5 h-3.5 shrink-0 mt-0.5' />
          <p>
            Submitting this report will pause pension payments and flag the
            account for officer review. A pension officer will contact you
            within 3–5 working days.
          </p>
        </div>
      </div>

      <div className='flex gap-2 pt-1'>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          className='flex-1'>
          ← Back
        </Button>
        <Button
          type='submit'
          disabled={submitting}
          className='flex-1 bg-red-600 hover:bg-red-700 text-white'>
          {submitting ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Submitting…
            </>
          ) : (
            <>
              Submit Death Report <ChevronRight className='w-4 h-4 ml-1' />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
