import { TrendingUp, TrendingDown, Scale, PiggyBank } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReportChart } from "@/components/reports/report-chart";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { StatCardData } from "@/types";
import type { CategoryLine, ReportData } from "@/domain/reports/types";

function CategoryTable({
  title,
  lines,
  currency,
}: {
  title: string;
  lines: CategoryLine[];
  currency: string;
}) {
  if (lines.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((c) => (
              <TableRow key={c.name}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(c.value, currency)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">{c.percent}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/** Aperçu complet d'un rapport avant export. */
export function ReportPreview({ data, currency }: { data: ReportData; currency: string }) {
  const stats: StatCardData[] = [
    {
      id: "income",
      title: "Revenus",
      value: formatCurrency(data.summary.income, currency),
      change: "",
      trend: "neutral",
      icon: TrendingUp,
    },
    {
      id: "expense",
      title: "Dépenses",
      value: formatCurrency(data.summary.expense, currency),
      change: "",
      trend: "neutral",
      icon: TrendingDown,
    },
    {
      id: "balance",
      title: "Solde",
      value: formatCurrency(data.summary.balance, currency),
      change: "",
      trend: "neutral",
      icon: Scale,
    },
    {
      id: "savings",
      title: "Épargne",
      value: formatCurrency(data.summary.savings, currency),
      change: "",
      trend: "neutral",
      icon: PiggyBank,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ id, ...s }) => (
          <StatCard
            key={id}
            id={id}
            {...s}
            hideChange
            subtitle={`Taux d'épargne : ${data.summary.savingsRate}%`}
          />
        ))}
      </div>

      {/* Graphiques */}
      <ReportChart data={data} currency={currency} />

      {/* Tables catégories */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryTable
          title="Revenus par catégorie"
          lines={data.incomeByCategory}
          currency={currency}
        />
        <CategoryTable
          title="Dépenses par catégorie"
          lines={data.expenseByCategory}
          currency={currency}
        />
      </div>

      {/* Transactions */}
      {data.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions ({data.transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.slice(0, 25).map((t, i) => (
                  <TableRow key={`${t.date}-${i}`}>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="text-sm">
                      {t.type === "income" ? "Revenu" : "Dépense"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.category}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${t.type === "income" ? "text-primary" : ""}`}
                    >
                      {formatCurrency(t.amount, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.transactions.length > 25 && (
              <p className="text-muted-foreground mt-2 text-xs">
                Aperçu limité à 25 lignes — l&apos;export contient l&apos;ensemble.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
