"use client";

import { useForm, Controller } from "react-hook-form";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";

/**
 * Convex server errors arrive as a noisy string like:
 *   "[CONVEX M(...)] Server Error Uncaught Error: <user message> at handler ..."
 * This pulls out just the user-readable sentence and falls back to a generic message.
 */
function extractConvexMessage(err: unknown, fallback: string): string {
  const raw = getErrorMessage(err, fallback);
  const match = raw.match(/Uncaught Error:\s*([\s\S]+?)(?:\s+at\s+\w|\s*$)/);
  const extracted = match?.[1]?.trim();
  return extracted && extracted.length < 200 ? extracted : fallback;
}
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoBanner } from "@/components/report-death/InfoBanner";
import { FormField } from "@/components/report-death/FormField";

export interface PensionerInfo {
  _id: Id<"pensioners">;
  fullName: string;
  pensionId: string;
  status: string;
}

export interface NokInfo {
  _id: Id<"nextOfKin">;
  fullName: string;
  relationship: string;
  phone: string;
}

interface ConfirmFormValues {
  nokId: string;
  nin: string;
}

interface ConfirmStepProps {
  pensioner: PensionerInfo;
  nokList: NokInfo[];
  onNext: (nokId: string) => void;
  onBack: () => void;
}

/** Pensioner card shown at the top of the confirm step */
function PensionerCard({ pensioner }: { pensioner: PensionerInfo }) {
  return (
    <div className='p-4 rounded-xl bg-[#f0f7f0] border border-[#001407]/10 space-y-1'>
      <p className='text-[10px] font-semibold text-[#001407]/40 uppercase tracking-wide'>
        Account found
      </p>
      <p className='text-[15px] font-bold text-[#0c190c]'>
        {pensioner.fullName}
      </p>
      <p className='text-[11px] text-[#001407]/50 font-mono'>
        {pensioner.pensionId}
      </p>
      <span
        className={cn(
          "inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
          pensioner.status === "active" && "bg-green-100 text-green-700",
          pensioner.status === "suspended" && "bg-amber-100 text-amber-700",
          pensioner.status === "dormant" && "bg-slate-100 text-slate-600",
        )}>
        {pensioner.status}
      </span>
    </div>
  );
}

/** NIN input with live length counter and validity indicator */
function NinInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const ninValid = /^\d{11}$/.test(value.trim());

  return (
    <div className='relative'>
      <input
        type='text'
        inputMode='numeric'
        maxLength={11}
        placeholder='11-digit NIN'
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        aria-invalid={!!error}
        className={cn(
          "w-full h-10 font-mono text-[13px] border rounded-lg px-3 pr-9",
          "focus:outline-none focus:ring-1 transition-all placeholder:text-[#001407]/25",
          error
            ? "border-red-400 focus:ring-red-300 bg-red-50/30"
            : value.length === 0
              ? "border-[#001407]/15 focus:ring-[#004d19]/40"
              : ninValid
                ? "border-green-400 focus:ring-green-300 bg-green-50/30"
                : "border-amber-300 focus:ring-amber-200",
        )}
      />
      {/* Right-side indicator */}
      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
        {error ? (
          <AlertCircle className='w-4 h-4 text-red-400' />
        ) : value.length > 0 ? (
          ninValid ? (
            <CheckCircle2 className='w-4 h-4 text-green-500' />
          ) : (
            <span className='text-[10px] text-amber-600 font-medium'>
              {value.length}/11
            </span>
          )
        ) : null}
      </div>
    </div>
  );
}

export function ConfirmStep({
  pensioner,
  nokList,
  onNext,
  onBack,
}: ConfirmStepProps) {
  const verifyNokNin = useMutation(api.nextOfKin.verifyNokNin);

  const {
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmFormValues>({
    defaultValues: { nokId: "", nin: "" },
  });

  const selectedNokId = watch("nokId");

  // Already deceased — short-circuit
  if (pensioner.status === "deceased") {
    return (
      <div className='space-y-4'>
        <InfoBanner variant='error' title='Already recorded as deceased' center>
          <p>
            {pensioner.fullName}&apos;s account has already been marked
            deceased. If you believe this is incorrect, please contact your
            local pension office directly.
          </p>
        </InfoBanner>
        <Button variant='outline' onClick={onBack} className='w-full'>
          ← Go back
        </Button>
      </div>
    );
  }

  async function onSubmit({ nokId, nin }: ConfirmFormValues) {
    try {
      await verifyNokNin({
        nextOfKinId: nokId as Id<"nextOfKin">,
        nin: nin.trim(),
      });
      onNext(nokId);
    } catch (err) {
      // Surface the server-side NIN mismatch error directly under the NIN field
      setError("nin", {
        type: "server",
        message: extractConvexMessage(
          err,
          "Verification failed — please try again",
        ),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
      <PensionerCard pensioner={pensioner} />

      {nokList.length === 0 ? (
        <InfoBanner variant='warning' title='No next of kin on record'>
          This pensioner has no registered next of kin. Please visit your local
          pension office in person with valid identification.
        </InfoBanner>
      ) : (
        <>
          {/* NOK selector */}
          <FormField
            label='Select your name (next of kin)'
            required
            error={errors.nokId?.message}>
            <Controller
              name='nokId'
              control={control}
              rules={{ required: "Please select your name from the list" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-10 text-[12px] border-[#001407]/15'>
                    <SelectValue placeholder='Which next of kin are you?' />
                  </SelectTrigger>
                  <SelectContent className='bg-[#001407] text-white border-border rounded-lg'>
                    {nokList.map((nok) => (
                      <SelectItem
                        key={nok._id}
                        value={nok._id}
                        className='text-[12px] hover:bg-white/10'>
                        <span className='font-medium'>{nok.fullName}</span>
                        <span className='text-white/50 ml-2'>
                          ({nok.relationship})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {/* NIN — only visible once a NOK is selected */}
          {selectedNokId && (
            <FormField
              label='Your NIN'
              required
              error={errors.nin?.message}
              hint='We verify your NIN against the next of kin record to confirm your identity.'
              hintIcon={<Shield className='w-3 h-3' />}>
              <Controller
                name='nin'
                control={control}
                rules={{
                  required: "Please enter your 11-digit NIN",
                  pattern: {
                    value: /^\d{11}$/,
                    message: "NIN must be exactly 11 digits",
                  },
                }}
                render={({ field }) => (
                  <NinInput
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.nin?.message}
                  />
                )}
              />
            </FormField>
          )}
        </>
      )}

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
          disabled={isSubmitting || nokList.length === 0}
          className='flex-1 bg-[#001407] hover:bg-[#002a0f] text-white'>
          {isSubmitting ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Verifying…
            </>
          ) : (
            <>
              Continue <ChevronRight className='w-4 h-4 ml-1' />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
