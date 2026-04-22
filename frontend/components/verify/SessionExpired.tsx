import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SessionExpired() {
  return (
    <div className='max-w-xl mx-auto text-center py-16 space-y-4'>
      <XCircle className='h-14 w-14 text-destructive mx-auto' />
      <h3 className='text-lg font-semibold'>Session Expired</h3>
      <p className='text-sm text-muted-foreground'>
        Verification sessions expire after 15 minutes for security.
      </p>
      <Button onClick={() => window.location.reload()}>
        Start New Session
      </Button>
    </div>
  );
}
