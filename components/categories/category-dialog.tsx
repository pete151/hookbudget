"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/categories/category-form";
import type { CategoryFormValues } from "@/lib/validations/category";

/** Boîte de dialogue de création / édition d'une catégorie. */
export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  defaultValues: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => void;
  pending: boolean;
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de cette catégorie."
              : "Créez une catégorie personnelle pour organiser vos finances."}
          </DialogDescription>
        </DialogHeader>

        {/* `key` force la réinitialisation du formulaire à chaque ouverture/cible */}
        <CategoryForm
          key={`${mode}-${defaultValues.name}-${open}`}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          pending={pending}
          submitLabel={isEdit ? "Enregistrer" : "Créer la catégorie"}
        />
      </DialogContent>
    </Dialog>
  );
}
