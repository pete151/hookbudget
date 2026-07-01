"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm, type ExpenseFormCategory } from "@/components/expenses/expense-form";
import type { ExpenseFormValues } from "@/lib/validations/expense";

/** Boîte de dialogue de création / édition rapide d'une dépense. */
export function ExpenseDialog({
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
  defaultValues: ExpenseFormValues;
  categories: ExpenseFormCategory[];
  onSubmit: (values: ExpenseFormValues, addAnother: boolean) => void;
  pending: boolean;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la dépense" : "Nouvelle dépense"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de cette dépense."
              : "Enregistrez une nouvelle sortie d'argent."}
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm
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
