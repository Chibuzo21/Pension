"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Id } from "@/convex/_generated/dataModel";
import EnrollTopBar from "@/components/enroll/EnrollTopBar";
import TabSwitcher from "@/components/enroll/TabSwitcher";

export default function PensionerEnrolPage() {
  const params = useParams();
  const pensionerId = params.id as Id<"pensioners">;
  const router = useRouter();

  const pensioner = useQuery(
    api.pensioners.getById,
    pensionerId ? { id: pensionerId as Id<"pensioners"> } : "skip",
  );

  const [faceDone, setFaceDone] = useState(false);
  const [voiceDone, setVoiceDone] = useState(false);

  const bothDone = faceDone && voiceDone;

  if (!pensioner) {
    return (
      <div className='flex items-center justify-center h-[calc(100dvh-64px)]'>
        <Loader2 className='w-5 h-5 animate-spin text-g1' />
      </div>
    );
  }

  const initials = pensioner.fullName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("");

  return (
    <div className='overflow-y-auto h-[calc(100dvh-64px)]'>
      {/* Top bar */}

      <EnrollTopBar pensioner={pensioner} pensionerId={pensionerId} />

      <div className='max-w-xl mx-auto px-4 py-4 space-y-4'>
        {/* Pensioner identity strip */}
        <div className='flex items-center gap-3 bg-white border border-mist rounded-xl px-4 py-3 shadow-sm'>
          <div className='w-10 h-10 rounded-full bg-g1 text-white flex items-center justify-center text-sm font-bold shrink-0'>
            {initials}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-ink'>
              {pensioner.fullName}
            </p>
            <p className='text-[11px] text-muted-foreground font-mono'>
              {pensioner.pensionId}
            </p>
          </div>
        </div>

        {/* Both done */}
        {bothDone ? (
          <Card className='border-emerald-300 bg-emerald-50'>
            <CardContent className='px-5 py-8 text-center space-y-3'>
              <CheckCircle2 className='h-14 w-14 text-emerald-500 mx-auto' />
              <div>
                <p className='text-base font-bold text-emerald-700'>
                  Biometrics Fully Enrolled
                </p>
                <p className='text-xs text-emerald-600 mt-1'>
                  Face and voice enrolled for {pensioner.fullName}
                </p>
              </div>
              <div className='flex gap-2 justify-center flex-wrap pt-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    router.push(`/dashboard/admin/pensioners/${pensionerId}`)
                  }>
                  View Profile
                </Button>
                <Button
                  size='sm'
                  onClick={() => router.push("/dashboard/admin/verify")}>
                  Verify Now →
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TabSwitcher
            biometric={{ faceDone, voiceDone, setFaceDone, setVoiceDone }}
            pension={{ pensioner, pensionerId }}
          />
        )}
      </div>
    </div>
  );
}
