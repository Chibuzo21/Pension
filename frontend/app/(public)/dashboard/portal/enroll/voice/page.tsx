"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import VoiceEnrolWidget from "@/components/enroll/VoiceEnrollWidget";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PensionerVoiceEnrollPage() {
  const { pensioner, isLoaded } = useCurrentPensioner();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!pensioner) {
    return (
      <div className='max-w-md mx-auto py-10 px-4 text-center text-sm text-muted-foreground'>
        Your pensioner record could not be found. Please contact support.
      </div>
    );
  }

  return (
    <div className='max-w-xl mx-auto py-10 px-4 space-y-6'>
      <div>
        <h1 className='text-lg font-semibold'>Set up voice recognition</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Record your voice 3 times so the system can recognise you during
          monthly verification.
        </p>
      </div>

      <VoiceEnrolWidget
        pensionerId={pensioner._id}
        pensioner={pensioner}
        onDone={() => router.push("/dashboard/portal")}
      />
    </div>
  );
}
