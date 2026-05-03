"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import FaceEnrolWidget from "@/components/enroll/FaceEnrollWidget";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PensionerFaceEnrollPage() {
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
        <h1 className='text-lg font-semibold'>Set up face recognition</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          This is a one-time setup. Your face will be used for monthly
          verification.
        </p>
      </div>

      <FaceEnrolWidget
        pensionerId={pensioner._id}
        pensioner={pensioner}
        onDone={() => router.push("/dashboard/portal/enroll/voice")}
      />
    </div>
  );
}
