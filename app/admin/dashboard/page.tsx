import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Clock, XCircle, TriangleAlert } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/services/admin/analytics.service";
import { getSubscriptionStats } from "@/services/admin/subscription.service";
import { getRecentAudit } from "@/services/admin/audit.service";
import { listFeatureFlags } from "@/services/admin/feature-flag.service";
import { getSetting } from "@/services/admin/setting.service";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { StatCard } from "@/components/admin/stat-card";
import { AuditTable } from "@/components/admin/audit-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Tableau de bord" };

export default async function AdminDashboardPage() {
  await requireAdmin("analytics.view");

  const [analytics, subs, audit, flags, maintenance] = await Promise.all([
    getPlatformAnalytics(),
    getSubscriptionStats(),
    getRecentAudit(8),
    listFeatureFlags(),
    getSetting("maintenance_mode"),
  ]);

  const disabledFlags = flags.filter((f) => !f.enabled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">
          Vue d&apos;ensemble de la plateforme HookBudget.
        </p>
      </div>

      <AnalyticsCards data={analytics} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Abonnements actifs" value={subs.active} icon={CreditCard} />
        <StatCard label="En essai" value={subs.trial} icon={Clock} />
        <StatCard label="Annulés" value={subs.cancelled} icon={XCircle} />
        <StatCard label="Impayés" value={subs.pastDue} icon={TriangleAlert} />
      </div>

      {(maintenance === "true" || disabledFlags.length > 0) && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
              Alertes système
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            {maintenance === "true" && <p>⚠️ Le mode maintenance est activé.</p>}
            {disabledFlags.length > 0 && (
              <p>Fonctionnalités désactivées : {disabledFlags.map((f) => f.label).join(", ")}.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Activité récente (audit)</CardTitle>
          <Link href="/admin/audit-logs" className="text-primary text-sm hover:underline">
            Tout voir
          </Link>
        </CardHeader>
        <CardContent>
          <AuditTable logs={audit} />
        </CardContent>
      </Card>
    </div>
  );
}
