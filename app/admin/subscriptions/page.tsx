import type { Metadata } from "next";
import { CreditCard, Clock, XCircle, TriangleAlert } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import {
  getSubscriptionHistory,
  getSubscriptionStats,
  listSubscriptions,
} from "@/services/admin/subscription.service";
import { StatCard } from "@/components/admin/stat-card";
import { SubscriptionTable } from "@/components/admin/subscription-table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Abonnements" };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin("subscriptions.view");
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  const [stats, list, history] = await Promise.all([
    getSubscriptionStats(),
    listSubscriptions({ page }),
    getSubscriptionHistory(15),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abonnements</h1>
        <p className="text-muted-foreground text-sm">
          Aucun paiement réel — données de démonstration.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Actifs" value={stats.active} icon={CreditCard} />
        <StatCard label="Essais" value={stats.trial} icon={Clock} />
        <StatCard label="Annulés" value={stats.cancelled} icon={XCircle} />
        <StatCard label="Impayés" value={stats.pastDue} icon={TriangleAlert} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionTable subscriptions={list.items} />
          <AdminPagination page={list.page} totalPages={list.totalPages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique récent</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun événement.</p>
          ) : (
            <ul className="divide-border divide-y">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <Badge variant="outline" className="mr-2">
                      {h.plan}
                    </Badge>
                    {h.event} — {h.user.name}
                  </span>
                  <span className="text-muted-foreground text-xs">{formatDate(h.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
