import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getInsights } from "@/services/ai/insight.service";
import { InsightCard } from "@/components/ai/insight-card";

export const metadata: Metadata = { title: "Insights IA" };

export default async function AiInsightsPage() {
  const user = await requireAuth();
  const insights = await getInsights(user.id, {
    name: user.name,
    firstName: user.firstName,
    currency: user.currency ?? "XOF",
  });

  if (insights.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Pas encore assez de données pour générer des insights. Ajoutez des revenus, des dépenses et
        des budgets pour obtenir des analyses personnalisées.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight, i) => (
        <InsightCard key={i} insight={insight} />
      ))}
    </div>
  );
}
