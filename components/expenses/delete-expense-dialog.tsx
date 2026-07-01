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
import type { ExpenseListItem } from "@/services/expenses/expense.service";

/** Confirmation avant suppression d'une dépense. */
export function DeleteExpenseDialog({
  expense,
  onOpenChange,
  onConfirm,
  pending,
}: {
  expense: ExpenseListItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertDialog open={expense !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
          <AlertDialogDescription>
            La dépense <span className="text-foreground font-medium">« {expense?.title} »</span>{" "}
            sera supprimée définitivement. Cette action est irréversible.
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
