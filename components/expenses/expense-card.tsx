"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2, Repeat } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/config/payment-methods";
import type { ExpenseListItem } from "@/services/expenses/expense.service";

/** Représentation « carte » d'une dépense (mobile). */
export function ExpenseCard({
  expense,
  currency,
  onEdit,
  onDelete,
}: {
  expense: ExpenseListItem;
  currency: string;
  onEdit: (expense: ExpenseListItem) => void;
  onDelete: (expense: ExpenseListItem) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: expense.categoryColor ?? "#94a3b8" }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 truncate font-medium">
              {expense.title}
              {expense.isRecurring && <Repeat className="text-muted-foreground h-3.5 w-3.5" />}
            </p>
            <span className="shrink-0 font-semibold">
              {formatCurrency(expense.amount, currency)}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            {expense.categoryName ?? "Sans catégorie"} · {formatDate(expense.date)}
          </p>
          <Badge variant="secondary" className="mt-1 text-[10px] font-normal">
            {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-2 h-8 w-8"
              aria-label={`Actions pour ${expense.title}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/expenses/${expense.id}`}>
                <Eye className="h-4 w-4" />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(expense)}
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
