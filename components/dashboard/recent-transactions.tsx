import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { RecentTransaction } from "@/services/dashboard/dashboard.service";

/** Les 10 dernières transactions (revenus & dépenses). */
export function RecentTransactions({
  transactions,
  currency,
}: {
  transactions: RecentTransaction[];
  currency: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transactions récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Aucune transaction"
            description="Vos revenus et dépenses apparaîtront ici."
            actionLabel="Créer votre première dépense"
            actionHref="/dashboard/expenses/new"
          />
        ) : (
          <ul className="divide-border divide-y">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      isIncome
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {tx.categoryName ?? "Sans catégorie"} · {formatDate(tx.date)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isIncome ? "text-primary" : "text-foreground",
                      )}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {isIncome ? "Revenu" : "Dépense"}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
