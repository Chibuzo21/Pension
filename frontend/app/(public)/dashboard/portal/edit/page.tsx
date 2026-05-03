"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useConvexUser } from "@/lib/useConvexUser";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm, FormProvider } from "react-hook-form";
import { useState, useEffect } from "react"; // ← add useEffect
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditPersonalSection } from "@/components/portal/edit/EditPersonalSection";
import { EditServiceSection } from "@/components/portal/edit/EditServiceSection";
import { EditBankingSection } from "@/components/portal/edit/EditBankingSection";
import { CorrectionRequestSection } from "@/components/portal/edit/CorrectionRequestsSection";

interface EditForm {
  phone?: string;
  email?: string;
  address?: string;
  lastMda?: string;
  subTreasury?: string;
  dateOfEmployment?: string;
  dateOfRetirement?: string;
  bankName?: string;
  accountNumber?: string;
}

export default function EditProfilePage() {
  const { pensioner, isLoaded } = useCurrentPensioner();
  const { convexUser } = useConvexUser();
  const updatePensioner = useMutation(api.pensioners.updateProfile);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<EditForm>({
    defaultValues: {
      phone: "",
      email: "",
      address: "",
      lastMda: "",
      subTreasury: "",
      dateOfEmployment: "",
      dateOfRetirement: "",
      bankName: "",
      accountNumber: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // ✅ Populate form once pensioner data arrives — never call reset() in render
  useEffect(() => {
    if (!pensioner) return;
    reset({
      phone: pensioner.phone ?? "",
      email: pensioner.email ?? "",
      address: pensioner.address ?? "",
      lastMda: pensioner.lastMda ?? "",
      subTreasury: pensioner.subTreasury ?? "",
      dateOfEmployment: pensioner.dateOfEmployment ?? "",
      dateOfRetirement: pensioner.dateOfRetirement ?? "",
      bankName: pensioner.bankName ?? "",
      accountNumber: pensioner.accountNumber ?? "",
    });
  }, [pensioner]); // ← re-runs if pensioner reference changes; reset is stable so omit it

  async function onSubmit(data: EditForm) {
    if (!pensioner?._id) return;
    setSubmitting(true);
    try {
      await updatePensioner({
        pensionerId: pensioner._id,
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        lastMda: data.lastMda?.trim() || undefined,
        subTreasury: data.subTreasury || undefined,
        dateOfEmployment: data.dateOfEmployment || undefined,
        dateOfRetirement: data.dateOfRetirement || undefined,
        bankName: data.bankName || undefined,
        accountNumber: data.accountNumber?.trim() || undefined,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed — please try again"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className='max-w-2xl mx-auto px-4 py-5 space-y-4'>
        <Skeleton className='h-10 rounded-xl bg-smoke' />
        <Skeleton className='h-48 rounded-xl bg-smoke' />
        <Skeleton className='h-48 rounded-xl bg-smoke' />
      </div>
    );
  }

  if (!pensioner) {
    return (
      <div className='max-w-2xl mx-auto px-4 py-5'>
        <div className='flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          Pensioner profile not found. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className='max-w-2xl mx-auto px-4 py-5'>
        <div className='mb-6'>
          <h2 className='text-[18px] font-bold text-ink'>Edit Profile</h2>
          <p className='text-[12px] text-slate-400 mt-0.5'>
            Update your contact, service, and banking information. Your NIN, BVN
            and legal name cannot be changed here.
          </p>
        </div>

        <div className='mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2'>
          <AlertCircle className='h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5' />
          <p className='text-[11px] text-slate-500'>
            <span className='font-semibold text-slate-600'>
              {pensioner.fullName}
            </span>{" "}
            · NIN: ···{pensioner.nin?.slice(-4) ?? "—"} · Pension ID:{" "}
            {pensioner.pensionId ?? "—"}
            {" · "}
            <a
              href='mailto:support@youragency.gov.ng'
              className='underline underline-offset-2 text-slate-400 hover:text-slate-600'>
              Request a correction
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <EditPersonalSection />
          <EditServiceSection />
          <EditBankingSection />

          <div className='pb-8'>
            <Button
              type='submit'
              disabled={submitting}
              className='w-full h-11 bg-[#001407] hover:bg-[#002a0f] text-white font-semibold rounded-xl text-[13px]'>
              {submitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Saving changes…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
        <CorrectionRequestSection />
      </div>
    </FormProvider>
  );
}
