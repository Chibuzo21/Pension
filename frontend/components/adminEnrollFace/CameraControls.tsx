"use client";

import { Button } from "../ui/button";
import { Play, RotateCcw, Loader2 } from "lucide-react";

type Stage = "search" | "camera" | "preview" | "saving" | "done";

export default function CameraControls({
  stage,
  saving,
  onCapture,
  onRetake,
  onSave,
}: {
  stage: Stage;
  saving: boolean;
  onCapture: () => void;
  onRetake: () => void;
  onSave: () => void;
}) {
  return (
    <div className='flex gap-2'>
      {stage === "camera" && (
        <Button className='flex-1' onClick={onCapture}>
          <Play className='h-4 w-4 mr-2' />
          Capture Photo
        </Button>
      )}

      {stage === "preview" && (
        <>
          <Button variant='outline' onClick={onRetake}>
            <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
            Retake
          </Button>

          <Button className='flex-1' onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Enrolling…
              </>
            ) : (
              "Confirm & Enrol"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
