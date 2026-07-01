"use client";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import type { BudgetView } from "@/services/budgets/budget.service";

/** Confirmation avant suppression d'un budget. */
export function DeleteBudgetDialog({
  budget,
  onOpenChange,
  onConfirm,
  pending,
}: {
  budget: BudgetView | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertDialog open={budget !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le budget <span className="text-foreground font-medium">« {budget?.name} »</span> sera
            supprimé définitivement. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={pending}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
