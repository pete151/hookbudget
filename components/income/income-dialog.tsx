"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncomeForm, type IncomeFormCategory } from "@/components/income/income-form";
import type { IncomeFormValues } from "@/lib/validations/income";

/** Boîte de dialogue de création / édition rapide d'un revenu. */
export function IncomeDialog({
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
  /** Change pour forcer la réinitialisation du formulaire (ex. « ajouter un autre »). */
  formKey: string;
  defaultValues: IncomeFormValues;
  categories: IncomeFormCategory[];
  onSubmit: (values: IncomeFormValues, addAnother: boolean) => void;
  pending: boolean;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le revenu" : "Nouveau revenu"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de ce revenu."
              : "Enregistrez une nouvelle rentrée d'argent."}
          </DialogDescription>
        </DialogHeader>

        <IncomeForm
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
