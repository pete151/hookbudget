"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface RowActionsProps {
  income: IncomeListItem;
  onEdit: (income: IncomeListItem) => void;
  onDelete: (income: IncomeListItem) => void;
}

/** Menu d'actions d'une ligne (voir / modifier / supprimer). */
function RowActions({ income, onEdit, onDelete }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
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
  );
}

/** Pastille de catégorie (point coloré + nom). */
function CategoryLabel({ name, color }: { name: string | null; color: string | null }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "#94a3b8" }}
      />
      <span className="truncate">{name ?? "Sans catégorie"}</span>
    </span>
  );
}

/** Tableau des revenus (desktop). */
export function IncomeTable({
  items,
  currency,
  onEdit,
  onDelete,
}: {
  items: IncomeListItem[];
  currency: string;
  onEdit: (income: IncomeListItem) => void;
  onDelete: (income: IncomeListItem) => void;
}) {
  return (
    <div className="border-border rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Date</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-[52px]" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(income.date)}
              </TableCell>
              <TableCell className="font-medium">{income.title}</TableCell>
              <TableCell className="text-sm">
                <CategoryLabel name={income.categoryName} color={income.categoryColor} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {income.source ?? "—"}
              </TableCell>
              <TableCell className="text-primary text-right font-semibold">
                {formatCurrency(income.amount, currency)}
              </TableCell>
              <TableCell>
                <RowActions income={income} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
