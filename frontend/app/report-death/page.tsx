"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { uploadToConvex } from "@/lib/uploadToConvex";

import { StepBar, type Step } from "@/components/report-death/StepBar";
import { LookupStep } from "@/components/report-death/steps/LookupStep";
import { ConfirmStep } from "@/components/report-death/steps/ConfirmStep";
import {
  DetailsStep,
  type DetailsFormValues,
} from "@/components/report-death/steps/DetailsStep";
import { DoneStep } from "@/components/report-death/steps/DoneStep";

export default function ReportDeathPage() {
  const [step, setStep] = useState<Step>("lookup");
  const [pensionId, setPensionId] = useState<string | null>(null);
  const [selectedNokId, setSelectedNokId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedPensionerName, setSubmittedPensionerName] = useState("");

  // Reactive queries — only fire once IDs are available
  const lookupResult = useQuery(
    api.pensioners.getByPensionId,
    pensionId ? { pensionId } : "skip",
  );

  const nokList = useQuery(
    api.nextOfKin.listForPensioner,
    lookupResult?._id ? { pensionerId: lookupResult._id } : "skip",
  );

  const submitDeathClaim = useMutation(api.nextOfKin.submitDeathClaim);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const notFound = pensionId && lookupResult === null;
  const pensioner = lookupResult ?? null;

  // app/report-death/page.tsx — replace handleSubmitClaim and add the mutation

  // 1. Add this mutation at the top of ReportDeathPage alongside submitDeathClaim:
  //    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // 2. Replace handleSubmitClaim with this:

  async function handleSubmitClaim({
    dateOfDeath,
    notes,
    file,
  }: {
    dateOfDeath: string;
    notes: string;
    file: File | null;
  }) {
    if (!pensioner || !selectedNokId) return;
    setSubmitting(true);
    try {
      // Upload the certificate first if one was provided
      let deathCertificateStorageId = "no_cert";
      if (file) {
        deathCertificateStorageId = await uploadToConvex(
          file,
          generateUploadUrl,
        );
      }

      await submitDeathClaim({
        pensionerId: pensioner._id,
        claimedByNextOfKinId: selectedNokId as Id<"nextOfKin">,
        deathCertificateStorageId,
        // No submittedByUserId — public submission, NIN was verified at step 2
        notes,
        dateOfDeath,
      });

      setSubmittedPensionerName(pensioner.fullName);
      setStep("done");
    } catch (err) {
      toast.error(getErrorMessage(err, "Submission failed — please try again"));
    } finally {
      setSubmitting(false);
    }
  }

  // 3. Add this import at the top of the file:
  //    import { uploadToConvex } from "@/lib/uploadToConvex";

  function handleLookupFound(id: string) {
    setPensionId(id);
    setStep("confirm");
  }

  function handleConfirmNext(nokId: string) {
    setSelectedNokId(nokId);
    setStep("details");
  }

  function handleConfirmBack() {
    setStep("lookup");
    setPensionId(null);
    setSelectedNokId("");
  }

  return (
    <div className='min-h-screen bg-[#f6f9f6] flex flex-col'>
      {/* Top bar */}
      <div className='bg-[#001407] px-6 py-4 flex items-center gap-3'>
        <div className='w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center'>
          <FileText className='w-4 h-4 text-white/70' />
        </div>
        <div>
          <p className='text-white text-[13px] font-semibold'>
            Pension Death Report
          </p>
          <p className='text-white/40 text-[10px]'>
            State Pension Management System
          </p>
        </div>
      </div>

      <div className='flex-1 flex items-start justify-center px-4 py-10'>
        <div className='w-full max-w-lg'>
          {/* Card */}
          <div className='bg-white rounded-2xl border border-[#001407]/8 shadow-[0_2px_12px_rgba(0,20,7,0.08)] px-6 py-7'>
            <div className='mb-6'>
              <h1
                className='text-[20px] font-bold text-[#0c190c] mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Report a Pensioner&apos;s Death
              </h1>
              <p className='text-[12px] text-[#001407]/45'>
                For next of kin only. No account required.
              </p>
            </div>

            <StepBar current={step} />

            {/* ── Step 1: Lookup ── */}
            {step === "lookup" && (
              <div className='space-y-4'>
                <LookupStep onFound={handleLookupFound} />

                {notFound && (
                  <div className='p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700'>
                    No pensioner found with ID{" "}
                    <strong className='font-mono'>{pensionId}</strong>. Please
                    check the ID and try again, or contact your pension office.
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Confirm ── */}
            {step === "confirm" && (
              <>
                {/* Loading while query resolves */}
                {!pensioner && !notFound && (
                  <div className='flex items-center justify-center h-24 gap-2 text-[12px] text-[#001407]/40'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Looking up account…
                  </div>
                )}

                {/* Edge case: navigated to confirm but ID resolved as not found */}
                {notFound && (
                  <div className='space-y-4'>
                    <p className='text-[12px] text-red-600'>
                      No account found. Please go back and check the pension ID.
                    </p>
                    <Button
                      variant='outline'
                      onClick={() => setStep("lookup")}
                      className='w-full'>
                      ← Go back
                    </Button>
                  </div>
                )}

                {pensioner && (
                  <ConfirmStep
                    pensioner={pensioner}
                    nokList={nokList ?? []}
                    onNext={handleConfirmNext}
                    onBack={handleConfirmBack}
                  />
                )}
              </>
            )}

            {/* ── Step 3: Details ── */}
            {step === "details" && (
              <DetailsStep
                onSubmit={handleSubmitClaim}
                onBack={() => setStep("confirm")}
                submitting={submitting}
              />
            )}

            {/* ── Step 4: Done ── */}
            {step === "done" && (
              <DoneStep pensionerName={submittedPensionerName} />
            )}
          </div>

          <p className='text-center text-[10px] text-[#001407]/30 mt-4'>
            Having trouble? Contact your local pension office directly.
          </p>
        </div>
      </div>
    </div>
  );
}
