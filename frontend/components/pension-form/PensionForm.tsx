"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PensionerFormValues } from "@/types/pensioner-new";
import PersonalSection from "@/components/pensioner-new/PersonalSection";
import ServiceSection from "@/components/pensioner-new/ServiceSection";
import { NokFormSection } from "@/components/pensioner-new/NokForm";
import FinancialSection from "@/components/pensioner-new/FinancialSection";

export type PensionerFormProps = {
  mode: "create" | "edit";
  title: string;
  subtitle?: string;
  onSubmit: (values: PensionerFormValues) => Promise<void>;
  backHref: string;
  isReady?: boolean;
};

export function PensionerForm({
  mode,
  title,
  subtitle,
  onSubmit,
  backHref,
  isReady = true,
}: PensionerFormProps) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<PensionerFormValues>();

  const busy = isSubmitting || !isReady;

  return (
    // pb-10 gives breathing room at the bottom inside the scrollable main
    // No extra wrapper needed — main already has p-6
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className='max-w-4xl mx-auto space-y-5 pb-10'>
      {/* ── Header ── */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground'
          type='button'
          asChild>
          <Link href={backHref}>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>

        <div>
          <h2 className='text-lg font-semibold'>{title}</h2>
          {subtitle && (
            <p className='text-sm text-muted-foreground mt-0.5'>{subtitle}</p>
          )}
        </div>

        <Button
          type='submit'
          size='sm'
          className='ml-auto text-white py-2 px-4'
          disabled={busy}>
          {isSubmitting && (
            <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
          )}
          {mode === "create" ? "Save Pensioner" : "Save Changes"}
        </Button>
      </div>

      {/* ── Sections ── */}
      <PersonalSection />
      <ServiceSection />
      <FinancialSection />
      <NokFormSection />

      {/* ── Footer buttons ──
           Removed pb-6 here — pb-10 on the form itself handles the gap.
           The div just needs flex layout. */}
      <div className='flex justify-end gap-3'>
        <Button variant='outline' type='button' asChild>
          <Link href={backHref}>Cancel</Link>
        </Button>
        <Button className='text-white' type='submit' disabled={busy}>
          {isSubmitting && (
            <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
          )}
          {mode === "create" ? "Register Pensioner" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
