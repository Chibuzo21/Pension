import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export function NotLinkedNotice() {
  return (
    <Card className='border-dashed'>
      <CardContent className='px-4 py-8 text-center'>
        <User className='h-10 w-10 text-(--muted-foreground)/40 mx-auto mb-3' />
        <p className='text-sm font-medium'>
          Your account is not linked to a pensioner record
        </p>
        <p className='text-xs text-(--muted-foreground) mt-1'>
          Please contact your pension office with your Pension ID to link this
          account.
        </p>
      </CardContent>
    </Card>
  );
}
