"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { IncomeForm, type IncomeFormCategory } from "@/components/income/income-form";
import { incomeFormDefaults, type IncomeFormValues } from "@/lib/validations/income";
import { createIncomeAction } from "@/actions/income";

/** Formulaire plein écran de création d'un revenu (route `/dashboard/income/new`). */
export function NewIncomeForm({ categories }: { categories: IncomeFormCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [resetNonce, setResetNonce] = React.useState(0);

  function handleSubmit(values: IncomeFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = await createIncomeAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Revenu ajouté");
      if (addAnother) {
        setResetNonce((n) => n + 1);
      } else {
        router.push("/dashboard/income");
        router.refresh();
      }
    });
  }

  return (
    <IncomeForm
      key={resetNonce}
      mode="create"
      defaultValues={incomeFormDefaults()}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/income")}
      pending={isPending}
    />
  );
}
