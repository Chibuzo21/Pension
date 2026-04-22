"use client";

import { useCurrentPensioner } from "@/lib/useCurrentPensioner";
import { useUser } from "@clerk/nextjs";

export function WelcomeHeader() {
  const { user } = useUser();
  const { pensioner } = useCurrentPensioner();

  const initial = (pensioner?.fullName ?? user?.firstName ?? "P")[0];
  const firstName =
    pensioner?.fullName?.split(" ")[0] ?? user?.firstName ?? "Pensioner";

  return (
    <div className='flex items-center gap-4'>
      <div className='w-12 h-12 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center text-lg font-bold shrink-0'>
        {initial}
      </div>
      <div>
        <h2 className='text-lg font-semibold'>Welcome, {firstName}</h2>
        <p className='text-sm text-(--muted-foreground)'>
          {pensioner
            ? `Pension ID: ${pensioner.pensionId}`
            : "Pension self-service portal"}
        </p>
      </div>
    </div>
  );
}
