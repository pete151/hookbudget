"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2, Repeat } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function RowActions({
  expense,
  onEdit,
  onDelete,
}: {
  expense: ExpenseListItem;
  onEdit: (expense: ExpenseListItem) => void;
  onDelete: (expense: ExpenseListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
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
  );
}

/** Tableau des dépenses (desktop). */
export function ExpenseTable({
  items,
  currency,
  onEdit,
  onDelete,
}: {
  items: ExpenseListItem[];
  currency: string;
  onEdit: (expense: ExpenseListItem) => void;
  onDelete: (expense: ExpenseListItem) => void;
}) {
  return (
    <div className="border-border rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Date</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-[52px]" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell className="font-medium">
                <span className="flex items-center gap-1.5">
                  {expense.title}
                  {expense.isRecurring && (
                    <Repeat className="text-muted-foreground h-3.5 w-3.5" aria-label="Récurrente" />
                  )}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: expense.categoryColor ?? "#94a3b8" }}
                  />
                  <span className="truncate">{expense.categoryName ?? "Sans catégorie"}</span>
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(expense.amount, currency)}
              </TableCell>
              <TableCell>
                <RowActions expense={expense} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
