import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getExpenseById } from "@/services/expenses/expense.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseDetailActions } from "@/components/expenses/expense-detail-actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { PAYMENT_METHOD_LABELS, RECURRENCE_FREQUENCY_LABELS } from "@/lib/config/payment-methods";

export const metadata: Metadata = {
  title: "Détail de la dépense",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

/** Page détail d'une dépense. */
export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const expense = await getExpenseById(user.id, id);

  if (!expense) notFound();

  const currency = user.currency ?? "XOF";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/expenses">
          <ArrowLeft className="h-4 w-4" />
          Retour aux dépenses
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{expense.title}</CardTitle>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(expense.amount, currency)}
            </p>
          </div>
          <ExpenseDetailActions expense={expense} />
        </CardHeader>
        <CardContent>
          <InfoRow label="Catégorie">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: expense.categoryColor ?? "#94a3b8" }}
              />
              {expense.categoryName ?? "Sans catégorie"}
            </span>
          </InfoRow>
          <InfoRow label="Date">{formatDate(expense.date)}</InfoRow>
          <InfoRow label="Mode de paiement">
            <Badge variant="secondary" className="font-normal">
              {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
            </Badge>
          </InfoRow>
          <InfoRow label="Récurrence">
            {expense.isRecurring && expense.frequency
              ? RECURRENCE_FREQUENCY_LABELS[expense.frequency]
              : "Ponctuelle"}
          </InfoRow>
          {expense.description && (
            <div className="pt-3">
              <p className="text-muted-foreground mb-1 text-sm">Description</p>
              <p className="text-sm">{expense.description}</p>
            </div>
          )}
          {expense.notes && (
            <div className="pt-3">
              <p className="text-muted-foreground mb-1 text-sm">Notes</p>
              <p className="text-sm">{expense.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
