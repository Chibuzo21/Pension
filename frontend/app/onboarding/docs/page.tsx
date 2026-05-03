"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/useConvexUser";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DocType =
  | "Retirement Notice"
  | "Authorization Letter"
  | "ID Card"
  | "Clearance Form"
  | "Verification Certificate";

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
  type: DocType;
  filename: string;
  storageId: string;
}

export default function OnboardingDocsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { pensioner, isLoaded } = useCurrentPensioner();
  const { convexUserId } = useConvexUser();
  const insertDocument = useMutation(api.documents.insert);

  const [uploaded, setUploaded] = useState<Record<string, UploadedDoc>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const requiredDone = DOC_SLOTS.filter((s) => s.required).every(
    (s) => uploaded[s.type],
  );

  async function handleFileChange(
    slot: DocSlot,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file || !pensioner || !convexUserId) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG, or WEBP files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }

    setUploading((prev) => ({ ...prev, [slot.type]: true }));

    try {
      // 1. Get upload URL from Convex storage
      const { url } = await fetch("/api/storage/upload-url", {
        method: "POST",
      }).then((r) => r.json());

      // 2. Upload file
      const up = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await up.json();

      // 3. Save document record in Convex
      await insertDocument({
        pensionerId: pensioner._id as Id<"pensioners">,
        documentType: slot.type,
        storageId,
        filename: file.name,
        mimeType: file.type,
        uploadedBy: convexUserId as Id<"users">,
      });

      setUploaded((prev) => ({
        ...prev,
        [slot.type]: { type: slot.type, filename: file.name, storageId },
      }));
      toast.success(`${slot.label} uploaded`);
    } catch {
      toast.error(`Failed to upload ${slot.label} — please try again`);
    } finally {
      setUploading((prev) => ({ ...prev, [slot.type]: false }));
    }
  }

  function removeDoc(type: DocType) {
    setUploaded((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
    if (fileRefs.current[type]) fileRefs.current[type]!.value = "";
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
      toast.error("Something went wrong — please try again");
      setCompleting(false);
    }
  }

  return (
    <div className='min-h-screen flex bg-[#001407]'>
      {/* Left panel */}
      <div className='hidden lg:flex w-80 shrink-0 flex-col justify-between px-10 py-12'>
        <div>
          <div className='flex items-center gap-2.5 mb-16'>
            <div className='w-8 h-8 rounded-lg bg-[#c8960c]/20 border border-[#c8960c]/30 flex items-center justify-center'>
              <ShieldCheck className='w-4 h-4 text-[#c8960c]' />
            </div>
            <span className='text-white text-[11px] font-bold tracking-widest uppercase'>
              BPMLVS
            </span>
          </div>

          <div className='space-y-6'>
            {[
              { n: "01", label: "Identity verified", done: true },
              { n: "02", label: "Face recognition set up", done: true },
              { n: "03", label: "Voice recorded", done: true },
              { n: "04", label: "Upload documents", done: false, active: true },
            ].map(({ n, label, done, active }) => (
              <div key={n} className='flex items-center gap-3'>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border transition-all ${
                    done
                      ? "bg-[#c8960c] border-[#c8960c] text-black"
                      : active
                        ? "bg-white/10 border-white/40 text-white"
                        : "bg-transparent border-white/15 text-white/30"
                  }`}>
                  {done ? "✓" : n}
                </div>
                <span
                  className={`text-[12px] font-medium ${
                    done
                      ? "text-[#c8960c]"
                      : active
                        ? "text-white"
                        : "text-white/30"
                  }`}>
                  {label}
                </span>
                {active && (
                  <span className='ml-auto w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse' />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className='text-white/20 text-[10px] leading-relaxed'>
          Documents are stored securely and only accessible to authorised
          pension officers. Required documents are marked with *.
        </p>
      </div>

      {/* Right panel */}
      <div className='flex-1 relative flex flex-col items-center justify-center bg-[#f6f9f6] px-6 sm:px-10 py-12'>
        <div
          className='absolute top-0 left-0 right-0 h-0.75'
          style={{
            background: "linear-gradient(90deg, #004d19, #c8960c, transparent)",
          }}
        />

        {/* Step pills */}
        <div className='w-full max-w-lg mb-8'>
          <div className='flex items-center gap-1.5'>
            {["Personal", "Biometrics", "Documents"].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                  i === 2
                    ? "bg-[#001407] text-white"
                    : "bg-[#001407]/15 text-[#001407]/60"
                }`}>
                {i < 2 && <span className='text-[#c8960c]'>✓</span>}
                {i === 2 && (
                  <span className='w-1.5 h-1.5 rounded-full bg-[#c8960c] animate-pulse shrink-0' />
                )}
                {label}
              </div>
            ))}
          </div>
        </div>

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
            <div className='space-y-3 mb-8'>
              {DOC_SLOTS.map((slot) => {
                const doc = uploaded[slot.type];
                const isUploading = uploading[slot.type];

                return (
                  <div
                    key={slot.type}
                    className={`relative rounded-xl border-2 transition-all ${
                      doc
                        ? "border-emerald-400/60 bg-emerald-50"
                        : "border-dashed border-[#001407]/15 bg-white"
                    }`}>
                    <input
                      ref={(el) => {
                        fileRefs.current[slot.type] = el;
                      }}
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png,.webp'
                      className='absolute inset-0 opacity-0 cursor-pointer z-10'
                      disabled={!!doc || isUploading}
                      onChange={(e) => handleFileChange(slot, e)}
                    />

                    <div className='flex items-center gap-3 px-4 py-3.5'>
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          doc ? "bg-emerald-100" : "bg-[#001407]/5"
                        }`}>
                        {doc ? (
                          <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                        ) : isUploading ? (
                          <Loader2 className='w-4 h-4 text-[#001407]/40 animate-spin' />
                        ) : (
                          <FileText className='w-4 h-4 text-[#001407]/30' />
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='text-[12px] font-semibold text-[#0c190c]'>
                            {slot.label}
                          </p>
                          {slot.required && (
                            <span className='text-[10px] text-red-500 font-bold'>
                              *
                            </span>
                          )}
                          {!slot.required && (
                            <span className='text-[9px] text-[#001407]/30 font-medium uppercase tracking-wide'>
                              optional
                            </span>
                          )}
                        </div>
                        <p className='text-[11px] text-muted-foreground truncate'>
                          {doc ? doc.filename : slot.description}
                        </p>
                      </div>

                      {doc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDoc(slot.type);
                          }}
                          className='relative z-20 w-6 h-6 rounded-full bg-emerald-200 hover:bg-red-100 flex items-center justify-center transition-colors'>
                          <X className='w-3 h-3 text-emerald-700 hover:text-red-600' />
                        </button>
                      ) : (
                        <Upload className='w-4 h-4 text-[#001407]/25 shrink-0' />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className='space-y-3'>
            <Button
              className='w-full bg-[#001407] hover:bg-[#002a0f] text-white font-semibold h-11 rounded-xl'
              onClick={handleComplete}
              disabled={!requiredDone || completing}>
              {completing ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Finishing setup…
                </>
              ) : (
                <>
                  Complete registration
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
