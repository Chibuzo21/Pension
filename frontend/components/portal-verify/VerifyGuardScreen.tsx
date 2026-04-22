import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, XCircle } from "lucide-react";

type GuardReason = "not-linked" | "no-face" | "expired" | "loading";

interface Props {
  reason: GuardReason;
}

export function VerifyGuardScreen({ reason }: Props) {
  if (reason === "loading") return null;

  if (reason === "expired") {
    return (
      <div className='max-w-xl mx-auto text-center py-16 space-y-4'>
        <XCircle className='h-12 w-12 text-destructive mx-auto' />
        <h3 className='text-lg font-semibold'>Session Expired</h3>
        <p className='text-sm text-muted-foreground'>
          Sessions expire after 15 minutes for security.
        </p>
        <Button onClick={() => window.location.reload()}>
          Start New Session
        </Button>
      </div>
    );
  }

  const config = {
    "not-linked": {
      title: "Account not linked",
      body: "Your account hasn't been linked to a pensioner record. Contact your pension office.",
    },
    "no-face": {
      title: "No face enrolled",
      body: "You need a face reference enrolled before verifying. Please visit your pension office.",
    },
  }[reason];

  return (
    <div className='max-w-xl mx-auto text-center py-16 space-y-4'>
      <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto' />
      <h3 className='text-lg font-semibold'>{config.title}</h3>
      <p className='text-sm text-muted-foreground'>{config.body}</p>
      <Button asChild variant='outline'>
        <Link href='/dashboard/portal'>Back to Portal</Link>
      </Button>
    </div>
  );
}
