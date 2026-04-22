import { useForm } from "react-hook-form";
import { useEffect } from "react";

export type DormantActionType = "deceased" | "incapacitated" | "reinstate";

export interface DormantActionState {
  pensionerId: string;
  pensionerName: string;
  action: DormantActionType;
}

interface DormantActionFormValues {
  notes: string;
  dateOfDeath: string;
}

interface DormantActionModalProps {
  dormantAction: DormantActionState;
  submitting: boolean;
  onConfirm: (data: { notes: string; dateOfDeath?: string }) => void;
  onCancel: () => void;
}

const ACTION_CONFIG: Record<
  DormantActionType,
  { title: string; bg: string; notesLabel: string; notesPlaceholder: string }
> = {
  deceased: {
    title: "Mark as Deceased",
    bg: "var(--red)",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "e.g. Confirmed by family visit, death certificate ref",
  },
  incapacitated: {
    title: "Mark as Incapacitated",
    bg: "#F59E0B",
    notesLabel: "Reason *",
    notesPlaceholder: "e.g. Suffered stroke, bedridden, unable to use device",
  },
  reinstate: {
    title: "Reinstate to Active",
    bg: "var(--g1)",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "e.g. Verified alive by phone call on dd/mm/yyyy",
  },
};

export function DormantActionModal({
  dormantAction,
  submitting,
  onConfirm,
  onCancel,
}: DormantActionModalProps) {
  const { action, pensionerName } = dormantAction;
  const config = ACTION_CONFIG[action];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DormantActionFormValues>({
    defaultValues: { notes: "", dateOfDeath: "" },
  });

  // Reset form when action changes
  useEffect(() => {
    reset({ notes: "", dateOfDeath: "" });
  }, [action, reset]);

  const onSubmit = (data: DormantActionFormValues) => {
    onConfirm({
      notes: data.notes,
      dateOfDeath: data.dateOfDeath || undefined,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "100%",
          maxWidth: 440,
          margin: "0 16px",
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          {config.title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          {pensionerName}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {action === "deceased" && (
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 4,
                }}>
                Date of Death (optional)
              </label>
              <input
                type='date'
                className='srch'
                style={{ width: "100%" }}
                {...register("dateOfDeath")}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}>
              {config.notesLabel}
            </label>
            <textarea
              className='srch'
              style={{
                width: "100%",
                minHeight: 70,
                resize: "vertical",
                fontSize: 11,
              }}
              placeholder={config.notesPlaceholder}
              {...register("notes", {
                required:
                  action === "incapacitated" ? "Reason is required" : false,
              })}
            />
            {errors.notes && (
              <p style={{ fontSize: 10, color: "var(--red)", marginTop: 3 }}>
                {errors.notes.message}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type='button'
              className='btn-sm boutline'
              style={{ fontSize: 11 }}
              onClick={onCancel}>
              Cancel
            </button>
            <button
              type='submit'
              className='btn-sm'
              disabled={submitting}
              style={{
                fontSize: 11,
                background: config.bg,
                color: "#fff",
                border: "none",
              }}>
              {submitting ? "Processing…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
