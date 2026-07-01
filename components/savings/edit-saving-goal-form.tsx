"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SavingGoalForm } from "@/components/savings/saving-goal-form";
import type { SavingGoalFormValues } from "@/lib/validations/saving";
import { updateSavingGoalAction } from "@/actions/savings";
import type { SavingGoalView } from "@/services/savings/saving.service";

function toDateInput(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Formulaire plein écran d'édition d'un objectif. */
export function EditSavingGoalForm({ goal }: { goal: SavingGoalView }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues: SavingGoalFormValues = {
    name: goal.name,
    description: goal.description ?? "",
    targetAmount: goal.targetAmount,
    targetDate: toDateInput(goal.targetDate),
    priority: goal.priority,
    color: goal.color ?? "#22c55e",
    icon: goal.icon ?? "target",
  };

  function handleSubmit(values: SavingGoalFormValues) {
    startTransition(async () => {
      const res = await updateSavingGoalAction(goal.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Objectif mis à jour");
      router.push(`/dashboard/savings/${goal.id}`);
      router.refresh();
    });
  }

  return (
    <SavingGoalForm
      mode="edit"
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/dashboard/savings/${goal.id}`)}
      pending={isPending}
    />
  );
}
