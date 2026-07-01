"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SavingGoalForm } from "@/components/savings/saving-goal-form";
import type { SavingGoalFormValues } from "@/lib/validations/saving";

/** Boîte de dialogue de création / édition d'un objectif. */
export function SavingGoalDialog({
  open,
  onOpenChange,
  mode,
  formKey,
  defaultValues,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  formKey: string;
  defaultValues: SavingGoalFormValues;
  onSubmit: (values: SavingGoalFormValues, addAnother: boolean) => void;
  pending: boolean;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'objectif" : "Nouvel objectif"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les paramètres de cet objectif."
              : "Définissez un objectif d'épargne à atteindre."}
          </DialogDescription>
        </DialogHeader>

        <SavingGoalForm
          key={formKey}
          mode={mode}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          pending={pending}
        />
      </DialogContent>
    </Dialog>
  );
}
