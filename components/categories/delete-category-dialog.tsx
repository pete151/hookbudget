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
import type { CategoryView } from "@/services/categories/categories.service";

/** Confirmation avant suppression définitive d'une catégorie. */
export function DeleteCategoryDialog({
  category,
  onOpenChange,
  onConfirm,
  pending,
}: {
  category: CategoryView | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertDialog open={category !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
          <AlertDialogDescription>
            La catégorie <span className="text-foreground font-medium">« {category?.name} »</span>{" "}
            sera supprimée définitivement. Cette action est irréversible.
            {category && category.usageCount > 0 && (
              <>
                {" "}
                Elle est utilisée par {category.usageCount} élément
                {category.usageCount > 1 ? "s" : ""} qui perdront leur catégorie.
              </>
            )}
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
