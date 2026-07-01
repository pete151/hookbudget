import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/services/admin/analytics.service";
import { getSubscriptionStats } from "@/services/admin/subscription.service";
import { formatCurrency } from "@/lib/utils/format";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Rapports" };

export default async function AdminReportsPage() {
  await requireAdmin("reports.view");
  const [analytics, subs] = await Promise.all([getPlatformAnalytics(), getSubscriptionStats()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <p className="text-muted-foreground text-sm">Synthèse consolidée de la plateforme.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={analytics.totalUsers} />
        <StatCard label="Actifs (30 j)" value={analytics.activeUsers30d} />
        <StatCard label="Abonnements actifs" value={subs.active} />
        <StatCard
          label="MRR (estimé)"
          value={formatCurrency(analytics.mrrPlaceholder, analytics.currency)}
          hint="Placeholder"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Exports
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          L&apos;export des rapports plateforme (CSV/PDF) est préparé pour le Sprint 15. Les
          indicateurs ci-dessus reflètent l&apos;état actuel de la base.
        </CardContent>
      </Card>
    </div>
  );
}
