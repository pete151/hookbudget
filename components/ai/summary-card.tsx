import type { SummaryData } from "@/domain/ai/types";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Carte de résumé périodique (hebdomadaire / mensuel / annuel). */
export function SummaryCard({ summary, currency }: { summary: SummaryData; currency: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{summary.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-muted-foreground text-xs">Revenus</p>
            <p className="text-sm font-semibold text-emerald-600">
              {formatCurrency(summary.income, currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Dépenses</p>
            <p className="text-sm font-semibold text-red-600">
              {formatCurrency(summary.expense, currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Solde</p>
            <p className="text-sm font-semibold">{formatCurrency(summary.balance, currency)}</p>
          </div>
        </div>
        <ul className="text-muted-foreground space-y-1 text-xs">
          {summary.highlights.map((h, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-primary">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
