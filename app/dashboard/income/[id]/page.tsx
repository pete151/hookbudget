import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getIncomeById } from "@/services/income/income.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IncomeDetailActions } from "@/components/income/income-detail-actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Détail du revenu",
};

/** Une ligne d'information (libellé + valeur). */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

/** Page détail d'un revenu. */
export default async function IncomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const income = await getIncomeById(user.id, id);

  if (!income) notFound();

  const currency = user.currency ?? "XOF";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/income">
          <ArrowLeft className="h-4 w-4" />
          Retour aux revenus
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{income.title}</CardTitle>
            <p className="text-primary mt-1 text-2xl font-semibold">
              {formatCurrency(income.amount, currency)}
            </p>
          </div>
          <IncomeDetailActions income={income} />
        </CardHeader>
        <CardContent>
          <InfoRow label="Catégorie">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: income.categoryColor ?? "#94a3b8" }}
              />
              {income.categoryName ?? "Sans catégorie"}
            </span>
          </InfoRow>
          <InfoRow label="Date">{formatDate(income.date)}</InfoRow>
          <InfoRow label="Source">{income.source ?? "—"}</InfoRow>
          <InfoRow label="Type">
            <Badge variant="default">Revenu</Badge>
          </InfoRow>
          {income.description && (
            <div className="pt-3">
              <p className="text-muted-foreground mb-1 text-sm">Description</p>
              <p className="text-sm">{income.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
