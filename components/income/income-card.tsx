"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { IncomeListItem } from "@/services/income/income.service";

/** Représentation « carte » d'un revenu (mobile). */
export function IncomeCard({
  income,
  currency,
  onEdit,
  onDelete,
}: {
  income: IncomeListItem;
  currency: string;
  onEdit: (income: IncomeListItem) => void;
  onDelete: (income: IncomeListItem) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: income.categoryColor ?? "#94a3b8" }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium">{income.title}</p>
            <span className="text-primary shrink-0 font-semibold">
              {formatCurrency(income.amount, currency)}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            {income.categoryName ?? "Sans catégorie"} · {formatDate(income.date)}
          </p>
          {income.source && (
            <p className="text-muted-foreground truncate text-xs">Source : {income.source}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-2 h-8 w-8"
              aria-label={`Actions pour ${income.title}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/income/${income.id}`}>
                <Eye className="h-4 w-4" />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(income)}>
              <Pencil className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(income)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
