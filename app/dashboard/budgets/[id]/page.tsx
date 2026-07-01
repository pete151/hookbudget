import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getBudgetById } from "@/services/budgets/budget.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BudgetProgress } from "@/components/budgets/budget-progress";
import { BudgetDetailActions } from "@/components/budgets/budget-detail-actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  BUDGET_PERIOD_LABELS,
  BUDGET_STATUS_COLORS,
  BUDGET_STATUS_LABELS,
  BUDGET_TYPE_LABELS,
} from "@/lib/config/budget-config";

export const metadata: Metadata = {
  title: "Détail du budget",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

/** Page détail d'un budget. */
export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const budget = await getBudgetById(user.id, id);

  if (!budget) notFound();

  const currency = user.currency ?? "XOF";
  const overBudget = budget.remainingAmount < 0;
  const alerts = [
    budget.alert50 && "50 %",
    budget.alert80 && "80 %",
    budget.alert100 && "100 %",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/budgets">
          <ArrowLeft className="h-4 w-4" />
          Retour aux budgets
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{budget.name}</CardTitle>
            {budget.description && (
              <p className="text-muted-foreground mt-1 text-sm">{budget.description}</p>
            )}
          </div>
          <BudgetDetailActions budget={budget} />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progression */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
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
              <span
                className={overBudget ? "text-destructive font-medium" : "text-primary font-medium"}
              >
                {overBudget
                  ? `Dépassé de ${formatCurrency(Math.abs(budget.remainingAmount), currency)}`
                  : `Restant ${formatCurrency(budget.remainingAmount, currency)}`}
              </span>
            </div>
          </div>

          <div>
            <InfoRow label="Type">{BUDGET_TYPE_LABELS[budget.budgetType]}</InfoRow>
            <InfoRow label="Période">{BUDGET_PERIOD_LABELS[budget.period]}</InfoRow>
            {budget.categoryName && <InfoRow label="Catégorie">{budget.categoryName}</InfoRow>}
            <InfoRow label="Du">{formatDate(budget.startDate)}</InfoRow>
            <InfoRow label="Au">{formatDate(budget.endDate)}</InfoRow>
            <InfoRow label="Statut">
              <Badge
                variant="outline"
                style={{
                  color: BUDGET_STATUS_COLORS[budget.status],
                  borderColor: BUDGET_STATUS_COLORS[budget.status],
                }}
              >
                {budget.isActive ? BUDGET_STATUS_LABELS[budget.status] : "Inactif"}
              </Badge>
            </InfoRow>
            <InfoRow label="Alertes">{alerts.length > 0 ? alerts.join(" · ") : "Aucune"}</InfoRow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
