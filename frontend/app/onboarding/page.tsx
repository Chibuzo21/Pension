// app/(onboarding)/onboarding/details/page.tsx  (or wherever your route lives)
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { LeftPanel } from "@/components/onboarding/LeftPanel";
import { PersonalSection } from "@/components/onboarding/PersonalSection";
import { ServiceSection } from "@/components/onboarding/ServiceSection";
import { BankingSection } from "@/components/onboarding/BankingSection";
import { DeceasedSection } from "@/components/onboarding/DeceasedSection";
import { NokFormSection } from "@/components/pensioner-new/NokForm";
import { RegistrationForm } from "@/components/onboarding/types";

const STEPS = [
  { n: "01", label: "Fill in your personal details", done: false },
  { n: "02", label: "Set up face & voice recognition", done: false },
  { n: "03", label: "Upload your pension documents", done: false },
];

export default function OnboardingPage() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const selfRegister = useMutation(api.pensioners.selfRegister);
  const [submitting, setSubmitting] = useState(false);

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkLoaded && user?.id ? { clerkId: user.id } : "skip",
  );

  const methods = useForm<RegistrationForm>({
    defaultValues: { nok: [] },
  });
  const { handleSubmit, watch } = methods;

  async function onSubmit(data: RegistrationForm) {
    // NOK mandatory guard — belt-and-suspenders on top of UI hint
    if (!data.nok || data.nok.length === 0) {
      methods.setError("nok" as any, {
        type: "manual",
        message: "At least one next of kin is required",
      });
      toast.error("Please add at least one next of kin before continuing");
      return;
    }

    if (!convexUser?._id) {
      toast.error("Session not ready — please refresh and try again");
      return;
    }

    setSubmitting(true);
    try {
      await selfRegister({
        fullName: data.fullName.trim(),
        dob: data.dob,
        nin: data.nin.trim(),
        bvn: data.bvn?.trim() || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        lastMda: data.lastMda?.trim() || undefined,
        subTreasury: data.subTreasury || undefined,
        lastRank: data.lastRank?.trim() || undefined,
        dateOfEmployment: data.dateOfEmployment || undefined,
        dateOfRetirement: data.dateOfRetirement || undefined,
        bankName: data.bankName || undefined,
        accountNumber: data.accountNumber?.trim() || undefined,
        gratuityAmount: Number(data.gratuityAmount?.trim()) || undefined,
        gratuityPaid: Number(data.gratuityPaid?.trim()) || undefined,
        userId: convexUser._id as Id<"users">,
        // Pass deceased registration data if set
        isDeceased: data.isDeceased || false,
        dateOfDeath: data.isDeceased ? data.dateOfDeath : undefined,
        registrantName: data.isDeceased ? data.registrantName : undefined,
        registrantRelationship: data.isDeceased
          ? data.registrantRelationship
          : undefined,
        registrantPhone: data.isDeceased ? data.registrantPhone : undefined,
        nok: data.nok.map((n) => ({
          fullName: n.fullName.trim(),
          relationship: n.relationship,
          phone: n.phone.trim(),
          nin: n.nin?.trim() || undefined,
          address: n.address?.trim() || undefined,
        })),
      });

      const res = await fetch("/api/onboarding/advance-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "face", role: "pensioner" }),
      });
      if (!res.ok) throw new Error("Failed to advance step");

      await user!.reload();

      // If deceased, skip biometric onboarding — go straight to done/confirmation
      router.replace(
        data.isDeceased ? "/onboarding/submitted" : "/onboarding/face",
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Registration failed — please try again"),
      );
      setSubmitting(false);
    }
  }

  const sessionReady = clerkLoaded && convexUser !== undefined;

  return (
    <FormProvider {...methods}>
      <div className='min-h-screen flex bg-[#001407]'>
        <LeftPanel steps={STEPS} />

        <div className='flex-1 relative bg-[#f6f9f6] overflow-y-auto'>
          {/* Progress stripe */}
          <div
            className='sticky top-0 z-10 h-0.75 w-full'
            style={{
              background:
                "linear-gradient(90deg, #004d19, #c8960c, transparent)",
            }}
          />

          <div className='px-6 sm:px-10 py-10 max-w-2xl mx-auto'>
            {/* Page header */}
            <div className='mb-8'>
              <div className='inline-flex items-center gap-1.5 bg-[#001407] text-white/75 text-[9.5px] font-semibold tracking-[1.4px] uppercase px-3.5 py-1.5 rounded-full mb-5'>
                <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
                Step 1 of 3 — Personal Details
              </div>
              <h2
                className='text-[28px] font-bold text-[#0c190c] mb-2 leading-tight'
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Register your pension account
              </h2>
              <p className='text-[13px] text-[#0c190c]/50 leading-relaxed'>
                Fill in your details below. Fields marked{" "}
                <span className='text-red-500 font-bold'>*</span> are required.
              </p>
            </div>

            {/* Loading state */}
            {!sessionReady && (
              <div className='flex items-center justify-center h-40 gap-2 text-[13px] text-[#001407]/40'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Loading your session…
              </div>
            )}

            {/* Webhook not fired yet */}
            {sessionReady && !convexUser && (
              <div className='p-5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-800 mb-6'>
                <p className='font-semibold mb-1'>Almost ready</p>
                <p>
                  Your account is still being set up. Please wait a moment and
                  refresh.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-3 text-[11px] font-semibold text-amber-700 underline underline-offset-2'>
                  Refresh now
                </button>
              </div>
            )}

            {sessionReady && convexUser && (
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <PersonalSection />
                <ServiceSection />
                <BankingSection />

                {/* NOK — mandatory */}
                <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_1px_4px_rgba(0,20,7,0.06)] px-5 py-5'>
                  <NokFormSection />
                </div>

                {/* Deceased registration */}
                <DeceasedSection />

                {/* Submit */}
                <div className='pb-10'>
                  <Button
                    type='submit'
                    disabled={submitting}
                    className='w-full h-11 bg-[#001407] hover:bg-[#002a0f] text-white font-semibold rounded-xl text-[13px]'>
                    {submitting ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Saving your details…
                      </>
                    ) : (
                      <>
                        {watch("isDeceased")
                          ? "Submit registration for review"
                          : "Continue to biometric setup"}
                        <ChevronRight className='w-4 h-4 ml-1.5' />
                      </>
                    )}
                  </Button>
                  <p className='text-center text-[10px] text-[#001407]/30 mt-3'>
                    Your data is encrypted and only accessible to authorised
                    pension officers
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
