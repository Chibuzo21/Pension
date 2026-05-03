"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export function NotLinkedNotice() {
  return (
    <Card className='border-dashed'>
      <CardContent className='px-4 py-8 text-center'>
        <UserPlus className='h-10 w-10 text-muted-foreground/40 mx-auto mb-3' />
        <p className='text-sm font-medium'>
          Your account is not linked to a pension record
        </p>
        <p className='text-xs text-muted-foreground mt-1 mb-5'>
          Register your details to activate your pension portal and complete
          monthly biometric verification.
        </p>
        <div className='flex flex-col sm:flex-row gap-2 justify-center'>
          <Button
            asChild
            size='sm'
            className='bg-[#004d19] hover:bg-[#003d14] text-white'>
            <Link href='/onboarding/register'>Register now</Link>
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href='/onboarding'>I have a NIN on file</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
