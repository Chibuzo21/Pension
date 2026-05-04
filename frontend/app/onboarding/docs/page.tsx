"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/useConvexUser";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DocType =
  | "Retirement Notice"
  | "Authorization Letter"
  | "ID Card"
  | "Clearance Form";

interface DocSlot {
  type: DocType;
  label: string;
  description: string;
  required: boolean;
}

const DOC_SLOTS: DocSlot[] = [
  {
    type: "Retirement Notice",
    label: "Retirement Notice",
    description: "Official letter from your last ministry/agency",
    required: true,
  },
  {
    type: "ID Card",
    label: "Government-issued ID",
    description: "NIN slip, voter's card, national ID, or passport",
    required: true,
  },
  {
    type: "Authorization Letter",
    label: "Authorization Letter",
    description: "If applicable — signed by a supervising officer",
    required: false,
  },
  {
    type: "Clearance Form",
    label: "Clearance Form",
    description: "Ministry clearance form if available",
    required: false,
  },
];

interface UploadedDoc {
  filename: string;
  storageId: string;
}

// One key per DocType in the form
type DocsForm = {
  [K in DocType]?: UploadedDoc;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_BYTES = 5 * 1024 * 1024;

export default function OnboardingDocsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { pensioner, isLoaded } = useCurrentPensioner();
  const { convexUserId } = useConvexUser();
  const insertDocument = useMutation(api.documents.insert);

  const [uploading, setUploading] = useState<Partial<Record<DocType, boolean>>>(
    {},
  );
  const [completing, setCompleting] = useState(false);

  const {
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm<DocsForm>({ defaultValues: {} });

  const watchedDocs = watch();

  const requiredDone = DOC_SLOTS.filter((s) => s.required).every(
    (s) => !!watchedDocs[s.type],
  );

  async function uploadFile(
    slot: DocSlot,
    file: File,
    onChange: (v: UploadedDoc) => void,
  ) {
    // Inline validation — errors go under the input, not toast
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(slot.type, {
        message: "Only PDF, JPG, PNG, or WEBP files are accepted.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(slot.type, {
        message: `File too large — max 5 MB (this file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
      });
      return;
    }
    if (!pensioner || !convexUserId) {
      setError(slot.type, {
        message: "Session not ready — please refresh and try again.",
      });
      return;
    }

    clearErrors(slot.type);
    setUploading((prev) => ({ ...prev, [slot.type]: true }));

    try {
      const { url } = await fetch("/api/storage/upload-url", {
        method: "POST",
      }).then((r) => r.json());

      const up = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await up.json();

      await insertDocument({
        pensionerId: pensioner._id as Id<"pensioners">,
        documentType: slot.type,
        storageId,
        filename: file.name,
        mimeType: file.type,
        uploadedBy: convexUserId as Id<"users">,
      });

      onChange({ filename: file.name, storageId });
    } catch {
      setError(slot.type, { message: `Upload failed — please try again.` });
    } finally {
      setUploading((prev) => ({ ...prev, [slot.type]: false }));
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      await fetch("/api/onboarding/advance-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "complete" }),
      });
      await user!.reload();
      router.replace("/dashboard/portal");
    } catch {
      setCompleting(false);
    }
  }

  return (
    <div className='min-h-screen flex bg-[#001407]'>
      {/* Left panel — unchanged */}
      <div className='hidden lg:flex w-80 shrink-0 flex-col justify-between px-10 py-12'>
        {/* ...your existing left panel JSX... */}
      </div>

      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-6 sm:px-10 py-12'>
        <div
          className='absolute top-0 left-0 right-0 h-0.75'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />

        {/* Breadcrumbs — unchanged */}

        <div className='w-full max-w-lg'>
          <h2
            className='text-[26px] font-bold text-[#0c190c] mb-1 leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Upload your documents
          </h2>
          <p className='text-[13px] text-muted-foreground mb-7 leading-relaxed'>
            Upload the required documents to complete your registration. You can
            skip optional ones and upload them later from your dashboard.
          </p>

          {!isLoaded ? (
            <div className='flex items-center justify-center h-48'>
              <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <div className='space-y-2 mb-8'>
              {DOC_SLOTS.map((slot) => {
                const isUploading = uploading[slot.type];
                const hasError = !!errors[slot.type];

                return (
                  <div key={slot.type}>
                    {/* Slot card */}
                    <Controller
                      control={control}
                      name={slot.type}
                      rules={
                        slot.required
                          ? { required: "This document is required." }
                          : {}
                      }
                      render={({ field }) => (
                        <div
                          className={`relative rounded-xl border-2 transition-all ${
                            field.value
                              ? "border-emerald-400/60 bg-emerald-50"
                              : hasError
                                ? "border-red-300/60 bg-red-50/40"
                                : "border-dashed border-[#001407]/15 bg-white"
                          }`}>
                          {/* Hidden file input — only active when no doc uploaded */}
                          {!field.value && (
                            <input
                              type='file'
                              accept='.pdf,.jpg,.jpeg,.png,.webp'
                              disabled={isUploading}
                              className='absolute inset-0 opacity-0 cursor-pointer z-10'
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  uploadFile(slot, file, field.onChange);
                                e.target.value = "";
                              }}
                            />
                          )}

                          <div className='flex items-center gap-3 px-4 py-3.5'>
                            {/* Icon */}
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                field.value
                                  ? "bg-emerald-100"
                                  : hasError
                                    ? "bg-red-100"
                                    : "bg-[#001407]/5"
                              }`}>
                              {field.value ? (
                                <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                              ) : isUploading ? (
                                <Loader2 className='w-4 h-4 text-[#001407]/40 animate-spin' />
                              ) : hasError ? (
                                <AlertCircle className='w-4 h-4 text-red-400' />
                              ) : (
                                <FileText className='w-4 h-4 text-[#001407]/30' />
                              )}
                            </div>

                            {/* Label + description */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-1.5'>
                                <p className='text-[12px] font-semibold text-[#0c190c]'>
                                  {slot.label}
                                </p>
                                {slot.required ? (
                                  <span className='text-[10px] text-red-500 font-bold'>
                                    *
                                  </span>
                                ) : (
                                  <span className='text-[9px] text-[#001407]/30 font-medium uppercase tracking-wide'>
                                    optional
                                  </span>
                                )}
                              </div>
                              <p className='text-[11px] text-muted-foreground truncate'>
                                {field.value
                                  ? field.value.filename
                                  : slot.description}
                              </p>
                            </div>

                            {/* Remove / upload icon */}
                            {field.value ? (
                              <button
                                type='button'
                                onClick={() => {
                                  field.onChange(undefined);
                                  clearErrors(slot.type);
                                }}
                                className='relative z-20 w-6 h-6 rounded-full bg-emerald-200 hover:bg-red-100 flex items-center justify-center transition-colors'>
                                <X className='w-3 h-3 text-emerald-700 hover:text-red-600' />
                              </button>
                            ) : (
                              <Upload className='w-4 h-4 text-[#001407]/25 shrink-0' />
                            )}
                          </div>
                        </div>
                      )}
                    />

                    {/* Inline error — shown under the slot card, not via toast */}
                    {errors[slot.type] && (
                      <p className='flex items-center gap-1.5 text-[11px] text-red-500 font-medium mt-1.5 px-1'>
                        <AlertCircle className='w-3 h-3 shrink-0' />
                        {errors[slot.type]!.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className='space-y-3'>
            <Button
              className='w-full bg-[#001407] hover:bg-[#002a0f] text-white font-semibold h-11 rounded-xl'
              onClick={handleSubmit(handleComplete)}
              disabled={!requiredDone || completing}>
              {completing ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Finishing setup…
                </>
              ) : (
                <>
                  Complete registration{" "}
                  <ChevronRight className='w-4 h-4 ml-1.5' />
                </>
              )}
            </Button>

            {!requiredDone && (
              <p className='text-center text-[11px] text-muted-foreground'>
                Upload the required documents (*) to continue
              </p>
            )}

            <button
              type='button'
              onClick={handleComplete}
              disabled={completing}
              className='w-full text-[11px] text-[#001407]/40 hover:text-[#001407]/60 transition-colors py-1'>
              Skip for now — I'll upload documents from my dashboard
            </button>
          </div>

          <p className='text-center text-[10px] text-[#a0b0a0] mt-6'>
            Step 4 of 4 — PDF, JPG, or PNG · max 5 MB per file
          </p>
        </div>
      </div>
    </div>
  );
}
