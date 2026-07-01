import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Lightbulb } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getAiOverview } from "@/services/ai/insight.service";
import { InsightCard } from "@/components/ai/insight-card";
import { PredictionCard } from "@/components/ai/prediction-card";
import { SummaryCard } from "@/components/ai/summary-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Assistant IA" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export default async function AiOverviewPage() {
  const user = await requireAuth();
  const currency = user.currency ?? "XOF";
  const { insights, predictions, summaries } = await getAiOverview(user.id, {
    name: user.name,
    firstName: user.firstName,
    currency,
  });

  return (
    <div className="space-y-8">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-start gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Discutez avec votre assistant</p>
              <p className="text-muted-foreground text-sm">
                Posez vos questions sur vos revenus, dépenses, budgets et épargne.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/ai/chat">Démarrer une conversation</Link>
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <SectionTitle>Analyses automatiques</SectionTitle>
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Pas encore assez de données pour générer des analyses. Ajoutez des revenus et des
            dépenses pour commencer.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle>Prévisions du mois à venir</SectionTitle>
        {predictions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Les prévisions apparaîtront dès que vous aurez au moins deux mois d&apos;activité.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {predictions.map((p) => (
              <PredictionCard key={p.kind} prediction={p} currency={currency} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle>Résumés</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {summaries.map((s) => (
            <SummaryCard key={s.period} summary={s} currency={currency} />
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2">
        <Lightbulb className="text-muted-foreground h-4 w-4" />
        <p className="text-muted-foreground text-xs">
          Les analyses et prévisions sont calculées à partir de vos données réelles.
          L&apos;assistant ne génère jamais d&apos;information inventée.
        </p>
      </div>
    </div>
  );
}
