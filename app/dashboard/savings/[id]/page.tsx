import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getSavingGoalById } from "@/services/savings/saving.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/categories/category-icon";
import { SavingProgress } from "@/components/savings/saving-progress";
import { SavingGoalDetailActions } from "@/components/savings/saving-goal-detail-actions";
import { ContributionList } from "@/components/savings/contribution-list";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  savingProgressColor,
  SAVING_PRIORITY_LABELS,
  SAVING_STATUS_LABELS,
} from "@/lib/config/saving-config";

export const metadata: Metadata = {
  title: "Détail de l'objectif",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

/** Page détail d'un objectif d'épargne. */
export default async function SavingGoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const goal = await getSavingGoalById(user.id, id);

  if (!goal) notFound();

  const currency = user.currency ?? "XOF";
  const color = savingProgressColor(goal.percent, goal.status);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/savings">
          <ArrowLeft className="h-4 w-4" />
          Retour aux objectifs
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CategoryIcon name={goal.icon} color={goal.color} />
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{goal.name}</CardTitle>
              {goal.description && (
                <p className="text-muted-foreground mt-1 text-sm">{goal.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SavingGoalDetailActions goal={goal} />

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

          <div>
            <InfoRow label="Statut">
              <Badge variant="outline" style={{ color, borderColor: color }}>
                {SAVING_STATUS_LABELS[goal.status]}
              </Badge>
            </InfoRow>
            <InfoRow label="Priorité">{SAVING_PRIORITY_LABELS[goal.priority]}</InfoRow>
            <InfoRow label="Date cible">
              {goal.targetDate ? formatDate(goal.targetDate) : "Aucune"}
            </InfoRow>
            <InfoRow label="Jours restants">
              {goal.daysRemaining === null
                ? "—"
                : goal.daysRemaining < 0
                  ? `En retard de ${Math.abs(goal.daysRemaining)} j`
                  : `${goal.daysRemaining} j`}
            </InfoRow>
            <InfoRow label="Atteinte estimée">
              {goal.estimatedDate ? formatDate(goal.estimatedDate) : "—"}
            </InfoRow>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionList
            contributions={goal.contributions}
            goalName={goal.name}
            currency={currency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
