// app/(portal)/enroll/page.tsx  (PensionerEnrollPage)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import TabSwitcher from "@/components/enroll/TabSwitcher";
import EnrollTopBar from "@/components/enroll/EnrollTopBar";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function PensionerEnrollPage() {
  const router = useRouter();
  const { pensioner, isLoaded, isLinked } = useCurrentPensioner();

  const [faceDone, setFaceDone] = useState(false);
  const [voiceDone, setVoiceDone] = useState(false);

  if (!isLoaded) return null;

  if (!isLinked || !pensioner) {
    router.replace("/onboarding");
    return null;
  }

  const allComplete = faceDone && voiceDone;

  return (
    <div className='max-w-xl mx-auto px-4 py-6 space-y-5'>
      <EnrollTopBar
        pensioner={pensioner}
        pensionerId={pensioner._id}
        // title='Set up your biometrics'
        // subtitle='Complete both face and voice enrollment to activate monthly verification'
      />

      {/* Progress pills */}
      <div className='flex gap-3'>
        <StatusPill label='Face' done={faceDone} />
        <StatusPill label='Voice' done={voiceDone} />
      </div>

      {!allComplete ? (
        // ✅ Now matches TabSwitcher's expected props exactly
        <TabSwitcher
          biometric={{ faceDone, voiceDone, setFaceDone, setVoiceDone }}
          pension={{ pensioner, pensionerId: pensioner._id }}
        />
      ) : (
        <div className='flex flex-col items-center gap-4 py-10 text-center'>
          <CheckCircle2 className='h-14 w-14 text-emerald-500' />
          <div>
            <p className='text-base font-semibold text-foreground'>
              Biometrics enrolled
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              You can now complete your monthly verification from the portal.
            </p>
          </div>
          <Button
            onClick={() => router.replace("/dashboard/portal")}
            className='bg-[#004d19] hover:bg-[#003d14] text-white mt-2'>
            Go to my portal
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
        done
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-muted border-border text-muted-foreground"
      }`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
      />
      {label} {done ? "✓" : "pending"}
    </div>
  );
}
