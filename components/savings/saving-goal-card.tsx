"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2, Plus, CalendarClock } from "lucide-react";

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
import { CategoryIcon } from "@/components/categories/category-icon";
import { SavingProgress } from "@/components/savings/saving-progress";
import { formatCurrency } from "@/lib/utils/format";
import { savingProgressColor, SAVING_STATUS_LABELS } from "@/lib/config/saving-config";
import type { SavingGoalView } from "@/services/savings/saving.service";

/** Libellé « jours restants » à partir du nombre de jours. */
function daysLabel(days: number | null): string {
  if (days === null) return "Sans échéance";
  if (days < 0) return `En retard de ${Math.abs(days)} j`;
  if (days === 0) return "Aujourd'hui";
  return `${days} j restants`;
}

/** Carte d'un objectif d'épargne. */
export function SavingGoalCard({
  goal,
  currency,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: SavingGoalView;
  currency: string;
  onEdit: (goal: SavingGoalView) => void;
  onDelete: (goal: SavingGoalView) => void;
  onContribute: (goal: SavingGoalView) => void;
}) {
  const color = savingProgressColor(goal.percent, goal.status);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <CategoryIcon name={goal.icon} color={goal.color} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{goal.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" style={{ color, borderColor: color }}>
                {SAVING_STATUS_LABELS[goal.status]}
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CalendarClock className="h-3 w-3" />
                {daysLabel(goal.daysRemaining)}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mt-1 -mr-2 h-8 w-8"
                aria-label={`Actions pour ${goal.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onContribute(goal)}>
                <Plus className="h-4 w-4" />
                Contribuer
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/savings/${goal.id}`}>
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(goal)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(goal)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold">
              {formatCurrency(goal.currentAmount, currency)}
              <span className="text-muted-foreground text-sm font-normal">
                {" / "}
                {formatCurrency(goal.targetAmount, currency)}
              </span>
            </span>
            <span className="text-sm font-medium" style={{ color }}>
              {goal.percent}%
            </span>
          </div>
          <SavingProgress percent={goal.percent} status={goal.status} />
          <p className="text-muted-foreground text-xs">
            Reste {formatCurrency(goal.remainingAmount, currency)}
          </p>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={() => onContribute(goal)}>
          <Plus className="h-4 w-4" />
          Contribuer
        </Button>
      </CardContent>
    </Card>
  );
}
