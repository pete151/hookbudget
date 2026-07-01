"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContributionForm } from "@/components/savings/contribution-form";
import type { ContributionFormValues } from "@/lib/validations/saving";

/** Boîte de dialogue d'ajout / édition d'une contribution. */
export function ContributionDialog({
  open,
  onOpenChange,
  goalName,
  mode,
  formKey,
  defaultValues,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  mode: "create" | "edit";
  formKey: string;
  defaultValues: ContributionFormValues;
  onSubmit: (values: ContributionFormValues) => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifier la contribution" : "Nouvelle contribution"}
          </DialogTitle>
          <DialogDescription>Objectif « {goalName} »</DialogDescription>
        </DialogHeader>

        <ContributionForm
          key={formKey}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          pending={pending}
        />
      </DialogContent>
    </Dialog>
  );
}
