"use client";

import { useForm } from "react-hook-form";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoBanner } from "@/components/report-death/InfoBanner";
import { FormField } from "@/components/report-death/FormField";

interface LookupFormValues {
  pensionId: string;
}

interface LookupStepProps {
  onFound: (pensionId: string) => void;
}

export function LookupStep({ onFound }: LookupStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupFormValues>({ defaultValues: { pensionId: "" } });

  function onSubmit({ pensionId }: LookupFormValues) {
    return new Promise<void>((resolve) => {
      // Small UX delay before transitioning
      setTimeout(() => {
        onFound(pensionId.trim().toUpperCase());
        resolve();
      }, 300);
    });
  }

  return (
    <div className='space-y-5'>
      <InfoBanner variant='warning' title="Reporting a pensioner's death">
        This form is for next of kin only. Your submission will be reviewed by a
        pension officer before any account changes are made. Pension payments
        will be temporarily paused during review.
      </InfoBanner>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label='Pension ID / File Number'
          required
          error={errors.pensionId?.message}
          hint="The pension ID is on the pensioner's payment slip or pension booklet">
          <div className='flex gap-2'>
            <Input
              {...register("pensionId", {
                required: "Please enter a pension ID",
                validate: (v) =>
                  v.trim().length > 0 || "Please enter a pension ID",
              })}
              placeholder='e.g. PEN/ABS/0001234'
              className='font-mono text-[13px] h-10 border-[#001407]/15 focus:ring-[#004d19]/40'
              aria-invalid={!!errors.pensionId}
            />
            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-10 px-4 bg-[#001407] hover:bg-[#002a0f] text-white rounded-lg shrink-0'>
              {isSubmitting ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Search className='w-4 h-4' />
              )}
            </Button>
          </div>
        </FormField>
      </form>
    </div>
  );
}
