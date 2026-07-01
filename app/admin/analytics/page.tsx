import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/services/admin/analytics.service";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  await requireAdmin("analytics.view");
  const data = await getPlatformAnalytics();

  const maxGrowth = Math.max(1, ...data.growth.map((g) => g.count));
  const totalPlans = Math.max(1, ...data.planDistribution.map((p) => p.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Indicateurs clés de la plateforme.</p>
      </div>

      <AnalyticsCards data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Croissance des inscriptions (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {data.growth.map((g) => (
                <div key={g.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="bg-primary w-full rounded-t"
                    style={{
                      height: `${(g.count / maxGrowth) * 100}%`,
                      minHeight: g.count > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-muted-foreground text-[10px]">{g.label}</span>
                  <span className="text-xs font-medium">{g.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.planDistribution.map((p) => (
              <div key={p.tier} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.tier}</span>
                  <span className="text-muted-foreground">{p.count}</span>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${(p.count / totalPlans) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
