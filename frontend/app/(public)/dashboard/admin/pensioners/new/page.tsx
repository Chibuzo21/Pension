// app/admin/pensioners/new/page.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useConvexUser } from "@/lib/useConvexUser";
import { toast } from "sonner";
import { PensionerFormValues } from "@/types/pensioner-new";
import { PensionerFormProvider } from "@/context/PensionerFormProvider";
import { PensionerForm } from "@/components/pension-form/PensionForm";
import { useNokActions } from "@/lib/useNokAction";
import { getErrorMessage } from "@/lib/errors";

export default function NewPensionerPage() {
  const { convexUserId, isLoaded } = useConvexUser();
  const { handleSave } = useNokActions(convexUserId);
  const createPensioner = useMutation(api.pensioners.create);
  const router = useRouter();

  async function onSubmit(values: PensionerFormValues) {
    if (!convexUserId) return;
    try {
      const id = await createPensioner({
        pensionId: values.pensionId.trim().toUpperCase(),
        fullName: values.fullName.trim(),
        dob: values.dob,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        bvn: values.bvn || undefined,
        nin: values.nin || undefined,
        dateOfEmployment: values.dateOfEmployment || undefined,
        dateOfRetirement: values.dateOfRetirement || undefined,
        lastMda: values.lastMda || undefined,
        subTreasury: values.subTreasury || undefined,
        bankName: values.bankName || undefined,
        accountNumber: values.accountNumber || undefined,
        gratuityAmount: values.gratuityAmount ?? 0,
        gratuityPaid: values.gratuityPaid ?? 0,
        createdByUserId: convexUserId,
      });

      for (const nok of values.nok) {
        await handleSave(
          {
            fullName: nok.fullName,
            relationship: nok.relationship,
            phone: nok.phone,
            nin: nok.nin,
            address: nok.address,
          },
          null,
          id,
          () => {},
        );
      }

      toast.success(`${values.fullName} registered successfully`);
      router.push(`/dashboard/admin/pensioners/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    }
  }

  return (
    <PensionerFormProvider>
      <PensionerForm
        mode='create'
        title='Register New Pensioner'
        subtitle='All BPMLVS data fields'
        onSubmit={onSubmit}
        backHref='/dashboard/admin/pensioners'
        isReady={isLoaded}
      />
    </PensionerFormProvider>
  );
}
