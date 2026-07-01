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
import type { SavingGoalView } from "@/services/savings/saving.service";

/** Confirmation avant suppression d'un objectif d'épargne. */
export function DeleteSavingGoalDialog({
  goal,
  onOpenChange,
  onConfirm,
  pending,
}: {
  goal: SavingGoalView | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertDialog open={goal !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet objectif ?</AlertDialogTitle>
          <AlertDialogDescription>
            L&apos;objectif <span className="text-foreground font-medium">« {goal?.name} »</span> et
            toutes ses contributions seront supprimés définitivement. Cette action est irréversible.
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
