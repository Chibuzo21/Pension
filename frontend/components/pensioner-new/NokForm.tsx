// NokFormSection.tsx
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Phone, CreditCard } from "lucide-react";
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
import { Users } from "lucide-react";

import { PensionerFormValues } from "@/types/pensioner-new";
import { RELATIONSHIPS } from "@/types/pensioner";

export function NokFormSection({}) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PensionerFormValues>(); // assumes you wrap your form with <FormProvider>

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nok",
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

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Next of Kin</h3>
          <p className='text-xs text-muted-foreground'>
            {fields.length === 0
              ? "No next of kin added yet."
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

      {fields.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='py-10 text-center space-y-2'>
            <Users className='h-8 w-8 text-muted-foreground/30 mx-auto' />
            <p className='text-sm text-muted-foreground'>
              No next of kin added
            </p>
            <p className='text-xs text-muted-foreground/70 max-w-xs mx-auto'>
              Strongly recommended — required for death claim processing.
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
      ) : (
        <div className='space-y-3'>
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className='px-4 py-3 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Next of Kin #{index + 1}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                    onClick={() => remove(index)}>
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
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
                  {/* National ID */}
                  <div className=' space-y-1.5'>
                    <Label className='text-xs'>
                      National ID / NIN (optional)
                    </Label>
                    <Input
                      placeholder='NIN'
                      {...register(`nok.${index}.nin`)}
                    />
                  </div>

                  <div className=' space-y-1.5'>
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
