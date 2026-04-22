import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeathClaimAction } from "@/lib/useStatusActions";

import { Doc, Id } from "@/convex/_generated/dataModel";

interface DeathClaimTriggerProps {
  nokList: Doc<"nextOfKin">[];
  isDeceased: boolean;
  isSuspended: boolean;
  onOpenAddNok: () => void;
  pensionerId: Id<"pensioners">;
  convexUserId: Id<"users"> | null;
}

export function DeathClaimTrigger({
  nokList,
  isDeceased,
  isSuspended,
  onOpenAddNok,
  pensionerId,
  convexUserId,
}: DeathClaimTriggerProps) {
  const [open, setOpen] = useState(false);
  const [nokId, setNokId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const { saving, handleSubmit } = useDeathClaimAction(
    pensionerId,
    convexUserId as Id<"users">,
  );

  function handleClose() {
    setOpen(false);
    setNokId("");
    setFile(null);
    setNotes("");
  }

  if (isDeceased || isSuspended) return null;

  if (nokList.length === 0) {
    return (
      <Card className='border-dashed border-amber-200'>
        <CardContent className='px-4 py-3 text-center space-y-1.5'>
          <p className='text-xs text-muted-foreground'>
            No next of kin enrolled. Add one to enable death claim processing.
          </p>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs h-7 gap-1'
            onClick={onOpenAddNok}>
            Add Next of Kin
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className='border-red-100 bg-red-50/30'>
        <CardContent className='px-4 py-3 space-y-2'>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            If this pensioner has passed away, a next of kin can submit a death
            claim for review by a senior officer.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='w-full text-xs h-8 gap-1.5 border-red-200 text-red-700 hover:bg-red-50'
            onClick={() => setOpen(true)}>
            <FileText className='h-3.5 w-3.5' />
            Submit Death Claim
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Submit Death Claim</DialogTitle>
            <DialogDescription>
              This will immediately suspend the pensioner's account and pause
              all payments pending senior officer review.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3 py-1'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Next of Kin Submitting Claim *</Label>
              <Select value={nokId} onValueChange={setNokId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select next of kin…' />
                </SelectTrigger>
                <SelectContent>
                  {nokList.map((nok) => (
                    <SelectItem key={nok._id} value={nok._id}>
                      {nok.fullName} ({nok.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Death Certificate (optional)</Label>
              <Input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                className='text-xs cursor-pointer'
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className='text-[10px] text-muted-foreground'>
                PDF or image. Can be submitted later if not available now.
              </p>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>Notes (optional)</Label>
              <Textarea
                placeholder='Any additional context…'
                className='text-sm min-h-15 resize-none'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className='bg-red-600 hover:bg-red-700 text-white'
              disabled={saving || !nokId}
              onClick={() => handleSubmit(nokId, file, handleClose)}>
              {saving && <Loader2 className='h-3.5 w-3.5 mr-2 animate-spin' />}
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
