"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SavingGoalForm } from "@/components/savings/saving-goal-form";
import { savingGoalFormDefaults, type SavingGoalFormValues } from "@/lib/validations/saving";
import { createSavingGoalAction } from "@/actions/savings";

/** Formulaire plein écran de création d'un objectif. */
export function NewSavingGoalForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [resetNonce, setResetNonce] = React.useState(0);

  function handleSubmit(values: SavingGoalFormValues, addAnother: boolean) {
    startTransition(async () => {
      const res = await createSavingGoalAction(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Objectif créé");
      if (addAnother) {
        setResetNonce((n) => n + 1);
      } else {
        router.push("/dashboard/savings");
        router.refresh();
      }
    });
  }

  return (
    <SavingGoalForm
      key={resetNonce}
      mode="create"
      defaultValues={savingGoalFormDefaults()}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/savings")}
      pending={isPending}
    />
  );
}
