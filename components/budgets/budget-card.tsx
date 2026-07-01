"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BudgetProgress } from "@/components/budgets/budget-progress";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import {
  BUDGET_STATUS_COLORS,
  BUDGET_STATUS_LABELS,
  BUDGET_TYPE_LABELS,
} from "@/lib/config/budget-config";
import type { BudgetView } from "@/services/budgets/budget.service";

/** Carte d'un budget avec progression et couleur dynamique. */
export function BudgetCard({
  budget,
  currency,
  onEdit,
  onDelete,
}: {
  budget: BudgetView;
  currency: string;
  onEdit: (budget: BudgetView) => void;
  onDelete: (budget: BudgetView) => void;
}) {
  const overBudget = budget.remainingAmount < 0;

  return (
    <Card className={cn(!budget.isActive && "opacity-70")}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{budget.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{BUDGET_TYPE_LABELS[budget.budgetType]}</Badge>
              {budget.categoryName && (
                <Badge variant="secondary" className="font-normal">
                  {budget.categoryName}
                </Badge>
              )}
              <Badge
                variant="outline"
                style={{
                  color: BUDGET_STATUS_COLORS[budget.status],
                  borderColor: BUDGET_STATUS_COLORS[budget.status],
                }}
              >
                {budget.isActive ? BUDGET_STATUS_LABELS[budget.status] : "Inactif"}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mt-1 -mr-2 h-8 w-8"
                aria-label={`Actions pour ${budget.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/budgets/${budget.id}`}>
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(budget)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(budget)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Montant + progression */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight">
              {formatCurrency(budget.amount, currency)}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: BUDGET_STATUS_COLORS[budget.status] }}
            >
              {budget.percent}%
            </span>
          </div>
          <BudgetProgress percent={budget.percent} status={budget.status} />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Dépensé {formatCurrency(budget.spentAmount, currency)}
            </span>
            <span className={cn("font-medium", overBudget ? "text-destructive" : "text-primary")}>
              {overBudget
                ? `Dépassé de ${formatCurrency(Math.abs(budget.remainingAmount), currency)}`
                : `Restant ${formatCurrency(budget.remainingAmount, currency)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
