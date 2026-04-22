import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusAction } from "@/types/pensioner";

interface StatusChangeDialogProps {
  open: boolean;
  action: StatusAction | null;
  notes: string;
  dateOfDeath: string;
  saving: boolean;
  onNotesChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const DIALOG_CONFIG: Record<
  StatusAction,
  {
    title: string;
    description: string;
    notesLabel: string;
    notesPlaceholder: string;
    accent: string;
    confirmLabel: string;
    confirmClass: string;
  }
> = {
  deceased: {
    title: "Mark as Deceased",
    description:
      "This will permanently stop all pension payments. A senior officer must approve this action.",
    notesLabel: "Notes (optional)",
    notesPlaceholder:
      "e.g. Confirmed by family visit, death cert ref: DC/2024/001",
    accent: "border-l-4 border-l-red-600 bg-red-50",
    confirmLabel: "Confirm Death",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  incapacitated: {
    title: "Mark as Incapacitated",
    description:
      "The pensioner remains on the system but requires an alternative verification arrangement.",
    notesLabel: "Reason *",
    notesPlaceholder:
      "e.g. Suffered stroke, bedridden, unable to operate a device",
    accent: "border-l-4 border-l-amber-500 bg-amber-50",
    confirmLabel: "Mark Incapacitated",
    confirmClass: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  reinstate: {
    title: "Reinstate to Active",
    description:
      "The pensioner will return to active status and must complete their next monthly verification.",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "e.g. Confirmed alive via phone call on dd/mm/yyyy",
    accent: "border-l-4 border-l-[#004d19] bg-[#f6f9f6]",
    confirmLabel: "Reinstate",
    confirmClass: "bg-[#004d19] hover:bg-[#003311] text-white",
  },
};

export function StatusChangeDialog({
  open,
  action,
  notes,
  dateOfDeath,
  saving,
  onNotesChange,
  onDateChange,
  onConfirm,
  onClose,
}: StatusChangeDialogProps) {
  if (!action) return null;
  const config = DIALOG_CONFIG[action];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md border-border'>
        <DialogHeader>
          <DialogTitle className='text-[#0c190c]'>{config.title}</DialogTitle>
          <DialogDescription className='text-[#4a5e4a]'>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "rounded-lg px-3 py-2.5 text-xs text-[#4a5e4a] mb-1",
            config.accent,
          )}>
          This action will be logged with your user ID and timestamp.
        </div>

        <div className='space-y-3 py-1'>
          {action === "deceased" && (
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-[#4a5e4a]'>
                Date of Death (optional)
              </Label>
              <Input
                type='date'
                value={dateOfDeath}
                onChange={(e) => onDateChange(e.target.value)}
                className='border-border focus-visible:ring-[#004d19]'
              />
            </div>
          )}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-[#4a5e4a]'>
              {config.notesLabel}
            </Label>
            <Textarea
              className='text-sm min-h-20 resize-none border-border focus-visible:ring-[#004d19]'
              placeholder={config.notesPlaceholder}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-[#dce8dc] text-[#4a5e4a] hover:bg-[#f6f9f6]'>
            Cancel
          </Button>
          <Button
            disabled={saving}
            className={config.confirmClass}
            onClick={onConfirm}>
            {saving && <Loader2 className='h-3.5 w-3.5 mr-2 animate-spin' />}
            {config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
