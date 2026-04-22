// app/admin/pensioners/[id]/edit/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexUser } from "@/lib/useConvexUser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PensionerFormValues } from "@/types/pensioner-new";
import { PensionerFormProvider } from "@/context/PensionerFormProvider";
import { PensionerForm } from "@/components/pension-form/PensionForm";
import { useNokActions } from "@/lib/useNokAction";
import { getErrorMessage } from "@/lib/errors";

export default function EditPensionerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { convexUserId, isOfficer } = useConvexUser();

  const pensioner = useQuery(api.pensioners.getById, {
    id: id as Id<"pensioners">,
  });

  const updatePensioner = useMutation(api.pensioners.update);
  const removeNextOfKin = useMutation(api.nextOfKin.removeNextOfKin);
  const { handleSave } = useNokActions(convexUserId);

  // ── Loading / access guard ───────────────────────────────────────
  if (pensioner === undefined) {
    return (
      <div className='max-w-3xl mx-auto space-y-5'>
        <Skeleton className='h-9 w-48' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    );
  }

  if (!pensioner || !isOfficer) {
    return (
      <div className='text-center py-16 text-sm text-muted-foreground'>
        {!pensioner ? "Pensioner not found." : "Access denied."}
        <Button asChild variant='ghost' className='mt-4 block mx-auto'>
          <Link href='/dashboard/admin/pensioners'>← Back</Link>
        </Button>
      </div>
    );
  }

  // ── Map Convex record → form shape ───────────────────────────────
  // This is where the existing data is fed into the shared form.
  const defaultValues: PensionerFormValues = {
    pensionId: pensioner.pensionId ?? "", // read-only in edit, but still in the type
    fullName: pensioner.fullName ?? "",
    dob: pensioner.dob ?? "",
    email: pensioner.email ?? "",
    phone: pensioner.phone ?? "",
    address: pensioner.address ?? "",
    bvn: pensioner.bvn ?? "",
    nin: pensioner.nin ?? "",
    dateOfEmployment: pensioner.dateOfEmployment ?? "",
    dateOfRetirement: pensioner.dateOfRetirement ?? "",
    lastMda: pensioner.lastMda ?? "",
    subTreasury: pensioner.subTreasury ?? "",
    bankName: pensioner.bankName ?? "",
    accountNumber: pensioner.accountNumber ?? "",
    gratuityAmount: pensioner.gratuityAmount ?? 0,
    gratuityPaid: pensioner.gratuityPaid ?? 0,
    // ── This is the key part: map each existing NOK to the form shape
    nok: (pensioner.nextOfKin ?? []).map((n) => ({
      _id: n._id, // keep the ID so we can diff on save
      fullName: n.fullName ?? "",
      relationship: n.relationship ?? "",
      phone: n.phone ?? "",
      nin: n.nin ?? "",
      address: n.address ?? "",
    })),
  };

  // ── Submit handler ───────────────────────────────────────────────
  async function onSubmit(values: PensionerFormValues) {
    if (!convexUserId) return;
    try {
      // 1. Update core pensioner fields
      await updatePensioner({
        id: pensioner?._id as Id<"pensioners">,
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
        updatedByUserId: convexUserId,
      });
      const existingIds = (pensioner?.nextOfKin ?? []).map((n) => n._id);
      const submittedIds = values.nok
        .filter((n) => n._id)
        .map((n) => n._id as Id<"nextOfKin">);

      // Delete removed NOKs
      for (const oldId of existingIds) {
        if (!submittedIds.includes(oldId)) {
          await removeNextOfKin({ id: oldId });
        }
      }

      // Upsert each NOK
      for (const nok of values.nok) {
        await handleSave(
          {
            fullName: nok.fullName,
            relationship: nok.relationship,
            phone: nok.phone,
            nin: nok.nin,
            address: nok.address,
          },
          nok._id ?? null, // null = insert, Id = update
          pensioner?._id as Id<"pensioners">,
          () => {},
        );
      }

      toast.success("Pensioner record updated");
      router.push(`/dashboard/admin/pensioners/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    }
  }

  return (
    // Pass defaultValues here — the Provider initialises RHF with them
    <PensionerFormProvider defaultValues={defaultValues}>
      <PensionerForm
        mode='edit'
        title='Edit Pensioner'
        subtitle={pensioner.pensionId}
        onSubmit={onSubmit}
        backHref={`/dashboard/admin/pensioners/${id}`}
        isReady={!!convexUserId}
      />
    </PensionerFormProvider>
  );
}
