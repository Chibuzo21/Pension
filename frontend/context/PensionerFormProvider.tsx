"use client";

import { useForm, FormProvider } from "react-hook-form";
import {
  PensionerFormValues,
  DEFAULT_PENSIONER_VALUES,
} from "@/types/pensioner-new";

type Props = {
  children: React.ReactNode;
  defaultValues?: PensionerFormValues;
};

export function PensionerFormProvider({ children, defaultValues }: Props) {
  const methods = useForm<PensionerFormValues>({
    defaultValues: defaultValues ?? DEFAULT_PENSIONER_VALUES,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
