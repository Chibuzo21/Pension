"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useConvexUser } from "@/lib/useConvexUser";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  FilePen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

type CorrectionField = "fullName" | "nin" | "bvn";

const FIELD_OPTIONS: { value: CorrectionField; label: string; hint: string }[] =
  [
    {
      value: "fullName",
      label: "Legal Full Name",
      hint: "As it appears on your national ID or birth certificate",
    },
    {
      value: "nin",
      label: "NIN",
      hint: "11-digit National Identification Number",
    },
    { value: "bvn", label: "BVN", hint: "11-digit Bank Verification Number" },
  ];

const FIELD_LABELS: Record<CorrectionField, string> = {
  fullName: "Legal Full Name",
  nin: "NIN",
  bvn: "BVN",
};

const STATUS_CFG = {
  pending: { label: "Pending review", badge: "b-warn", dot: "bg-[#c8960c]" },
  approved: { label: "Approved", badge: "b-ok", dot: "bg-[#004d19]" },
  rejected: { label: "Rejected", badge: "b-fail", dot: "bg-[#b91c1c]" },
};

function PastRequests({
  pensionerId,
}: {
  pensionerId: Doc<"pensioners">["_id"];
}) {
  const requests = useQuery(api.correctionRequests.getMyRequests, {
    pensionerId,
  });
  if (!requests || requests.length === 0) return null;

  return (
    <div className='space-y-1.5 pt-1'>
      <p className='sb-sec !px-0 !pt-2'>Your previous requests</p>
      <ul className='space-y-1'>
        {requests.map((r) => {
          const cfg = STATUS_CFG[r.status as keyof typeof STATUS_CFG];
          return (
            <li
              key={r._id}
              className='card flex items-start justify-between gap-2 px-3 py-2.5'>
              <div className='min-w-0'>
                <p className='text-[11px] font-semibold text-[--ink]'>
                  {FIELD_LABELS[r.field as CorrectionField]}
                </p>
                <p className='mt-0.5 text-[10px] text-[--muted-foreground]'>
                  → <span className='font-mono'>{r.requestedValue}</span>
                </p>
                {r.reviewNote && (
                  <p className='mt-0.5 text-[9.5px] text-[--muted-foreground] italic'>
                    "{r.reviewNote}"
                  </p>
                )}
              </div>
              <span className={cn("badge", cfg.badge, "shrink-0 mt-0.5")}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CorrectionRequestSection() {
  const { pensioner } = useCurrentPensioner();
  const { convexUserId } = useConvexUser();
  const submitRequest = useMutation(api.correctionRequests.submit);

  const [open, setOpen] = useState(false);
  const [field, setField] = useState<CorrectionField | "">("");
  const [requestedValue, setRequestedValue] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!pensioner) return null;

  const selectedField = FIELD_OPTIONS.find((f) => f.value === field);

  async function handleSubmit() {
    if (!pensioner || !field || !requestedValue.trim()) return;
    setSubmitting(true);
    try {
      await submitRequest({
        pensionerId: pensioner._id,
        submittedByUserId: convexUserId ?? undefined,
        field: field as CorrectionField,
        requestedValue: requestedValue.trim(),
        supportingNote: note.trim() || undefined,
      });
      toast.success(
        "Correction request submitted — an admin will review it shortly",
      );
      setField("");
      setRequestedValue("");
      setNote("");
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit request"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='card overflow-hidden'>
      {/* Toggle header */}
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='ch w-full text-left hover:bg-[--smoke] transition-colors'>
        <div className='flex items-center gap-2'>
          <div className='w-5 h-5 rounded-md flex items-center justify-center bg-[--smoke]'>
            <FilePen className='h-3 w-3 text-[--g1]' />
          </div>
          <div>
            <p className='ct'>Request a data correction</p>
            <p className='text-[9.5px] text-[--muted-foreground]'>
              Legal name, NIN or BVN · requires admin approval
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[--muted-foreground] transition-transform duration-200 ml-auto",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className='cb space-y-3 bg-[--offwhite] border-t border-[--smoke]'>
          {/* Info callout */}
          <div className='flex items-start gap-2 rounded-lg bg-white border border-[--mist] px-3 py-2.5'>
            <AlertCircle className='h-3 w-3 shrink-0 mt-0.5 text-[--muted-foreground]' />
            <p className='text-[10px] text-[--muted-foreground] leading-relaxed'>
              These fields require manual verification. Your request will be
              reviewed by an administrator and applied only after approval.
            </p>
          </div>

          {/* Field selector */}
          <div className='space-y-1'>
            <p className='sb-sec !px-0 !pt-0'>Field to correct</p>
            <select
              value={field}
              onChange={(e) => {
                setField(e.target.value as CorrectionField);
                setRequestedValue("");
              }}
              className='srch w-full bg-white'>
              <option value=''>Select a field…</option>
              {FIELD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {selectedField && (
              <p className='text-[9.5px] text-[--muted-foreground]'>
                {selectedField.hint}
              </p>
            )}
          </div>

          {/* Current value */}
          {field && (
            <div className='space-y-1'>
              <p className='sb-sec !px-0 !pt-0'>Current value on record</p>
              <div className='rounded-lg border border-[--mist] bg-white px-3 py-2 font-mono text-[11px] text-[--muted-foreground]'>
                {field === "fullName"
                  ? pensioner.fullName
                  : field === "nin"
                    ? (pensioner.nin ?? "— not set")
                    : (pensioner.bvn ?? "— not set")}
              </div>
            </div>
          )}

          {/* Requested value */}
          {field && (
            <div className='space-y-1'>
              <p className='sb-sec !px-0 !pt-0'>Correct value</p>
              <input
                className='srch w-full font-mono bg-white'
                placeholder={
                  field === "fullName"
                    ? "Enter your correct legal name"
                    : field === "nin"
                      ? "11-digit NIN"
                      : "11-digit BVN"
                }
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
              />
            </div>
          )}

          {/* Note */}
          {field && (
            <div className='space-y-1'>
              <p className='sb-sec !px-0 !pt-0'>
                Supporting note{" "}
                <span className='font-normal normal-case tracking-normal'>
                  — optional
                </span>
              </p>
              <textarea
                rows={2}
                className='srch w-full resize-none bg-white'
                placeholder='e.g. Name was misspelled at enrollment. My ID shows the correct spelling.'
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          <button
            type='button'
            className='btn-sm bgreen w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!field || !requestedValue.trim() || submitting}
            onClick={handleSubmit}>
            {submitting ? (
              <>
                <Loader2 className='h-3.5 w-3.5 animate-spin' /> Submitting…
              </>
            ) : (
              "Submit correction request"
            )}
          </button>

          <PastRequests pensionerId={pensioner._id} />
        </div>
      )}
    </div>
  );
}
