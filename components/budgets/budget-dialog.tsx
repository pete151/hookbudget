"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetForm, type BudgetFormCategory } from "@/components/budgets/budget-form";
import type { BudgetFormValues } from "@/lib/validations/budget";

/** Boîte de dialogue de création / édition rapide d'un budget. */
export function BudgetDialog({
  open,
  onOpenChange,
  mode,
  formKey,
  defaultValues,
  categories,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  formKey: string;
  defaultValues: BudgetFormValues;
  categories: BudgetFormCategory[];
  onSubmit: (values: BudgetFormValues, addAnother: boolean) => void;
  pending: boolean;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le budget" : "Nouveau budget"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les paramètres de ce budget."
              : "Définissez une enveloppe de dépenses à suivre."}
          </DialogDescription>
        </DialogHeader>

        <BudgetForm
          key={formKey}
          mode={mode}
          defaultValues={defaultValues}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          pending={pending}
        />
      </DialogContent>
    </Dialog>
  );
}
