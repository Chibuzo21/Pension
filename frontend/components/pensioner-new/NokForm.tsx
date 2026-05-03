// components/pensioner-new/NokForm.tsx
// NOK is now MANDATORY — form won't submit without at least one next of kin.

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { RegistrationForm } from "@/components/onboarding/types";
import { RELATIONSHIPS } from "@/types/pensioner";

export function NokFormSection() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nok",
    // Minimum 1 rule enforced via validate on the array (see submit handler note below)
  });

  function addNok() {
    append({
      fullName: "",
      relationship: "Son",
      phone: "",
      nin: "",
      address: "",
    });
  }

  // Error message when array is empty (triggered by resolver or manual validation)
  const nokArrayError =
    (errors as any)?.nok?.root?.message ?? (errors as any)?.nok?.message;

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium flex items-center gap-1.5'>
            Next of Kin
            <span className='text-red-500 text-xs'>*</span>
          </h3>
          <p className='text-xs text-muted-foreground'>
            {fields.length === 0
              ? "At least one next of kin is required"
              : `${fields.length} record${fields.length !== 1 ? "s" : ""} added`}
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          variant='outline'
          className='text-xs h-7 gap-1'
          onClick={addNok}>
          <Plus className='h-3 w-3' /> Add
        </Button>
      </div>

      {/* Array-level error (shown when form submitted with 0 NOK) */}
      {nokArrayError && (
        <div className='flex items-center gap-1.5 text-[11px] text-red-500 font-medium px-1'>
          <AlertCircle className='w-3 h-3 shrink-0' />
          {nokArrayError}
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && (
        <Card
          className={`border-dashed ${nokArrayError ? "border-red-300 bg-red-50/30" : ""}`}>
          <CardContent className='py-10 text-center space-y-2'>
            <Users
              className={`h-8 w-8 mx-auto ${nokArrayError ? "text-red-300" : "text-muted-foreground/30"}`}
            />
            <p className='text-sm text-muted-foreground'>
              No next of kin added
            </p>
            <p className='text-xs text-muted-foreground/70 max-w-xs mx-auto'>
              Required for death claim processing and emergency contact.
            </p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='text-xs mt-2'
              onClick={addNok}>
              <Plus className='h-3.5 w-3.5 mr-1' /> Add Next of Kin
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fields */}
      {fields.length > 0 && (
        <div className='space-y-3'>
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className='px-4 py-3 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Next of Kin #{index + 1}
                  </span>
                  {/* Only allow removal if it would leave at least 1 */}
                  {fields.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                      onClick={() => remove(index)}>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  )}
                  {/* If only 1 record, show disabled remove with tooltip explanation */}
                  {fields.length === 1 && (
                    <span className='text-[10px] text-muted-foreground/50 italic'>
                      Required
                    </span>
                  )}
                </div>

                <div className='grid md:grid-cols-2 gap-3'>
                  {/* Full Name */}
                  <div className='md:col-span-2 space-y-1.5'>
                    <Label className='text-xs'>Full Name *</Label>
                    <Input
                      placeholder='e.g. Chidi Okonkwo'
                      {...register(`nok.${index}.fullName`, {
                        required: "Full name is required",
                      })}
                    />
                    {errors.nok?.[index]?.fullName && (
                      <p className='text-xs text-destructive'>
                        {errors.nok[index].fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>Relationship *</Label>
                    <Select
                      value={watch(`nok.${index}.relationship`)}
                      onValueChange={(v) =>
                        setValue(`nok.${index}.relationship`, v, {
                          shouldValidate: true,
                        })
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-g1 text-white border-border p-2 rounded-lg shadow-lg'>
                        {RELATIONSHIPS.map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className='hover:bg-white/10'>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.nok?.[index]?.relationship && (
                      <p className='text-xs text-destructive'>
                        {errors.nok[index].relationship.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>Phone *</Label>
                    <Input
                      placeholder='08012345678'
                      {...register(`nok.${index}.phone`, {
                        required: "Phone is required",
                      })}
                    />
                    {errors.nok?.[index]?.phone && (
                      <p className='text-xs text-destructive'>
                        {errors.nok[index].phone.message}
                      </p>
                    )}
                  </div>

                  {/* NIN */}
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>
                      National ID / NIN (optional)
                    </Label>
                    <Input
                      maxLength={11}
                      placeholder='NIN'
                      {...register(`nok.${index}.nin`, {
                        pattern: {
                          value: /^\d{11}$/,
                          message: "Must be exactly 11 digits",
                        },
                      })}
                    />
                    {errors.nok?.[index]?.nin && (
                      <p className='text-xs text-destructive'>
                        {errors.nok[index].nin.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className='space-y-1.5'>
                    <Label className='text-xs'>Address</Label>
                    <Input
                      placeholder='Address'
                      {...register(`nok.${index}.address`)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
