import { Users, UserPlus, Activity, DollarSign } from "lucide-react";

import type { PlatformAnalytics } from "@/services/admin/analytics.service";
import { formatCurrency } from "@/lib/utils/format";
import { StatCard } from "@/components/admin/stat-card";

/** Cartes d'analytics de la plateforme. */
export function AnalyticsCards({ data }: { data: PlatformAnalytics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Utilisateurs" value={data.totalUsers} icon={Users} />
      <StatCard
        label="Nouveaux (30 j)"
        value={data.newUsers30d}
        hint="Inscriptions sur 30 jours"
        icon={UserPlus}
      />
      <StatCard
        label="Actifs (30 j)"
        value={data.activeUsers30d}
        hint="Sessions récentes"
        icon={Activity}
      />
      <StatCard
        label="MRR (estimé)"
        value={formatCurrency(data.mrrPlaceholder, data.currency)}
        hint="Placeholder — aucun paiement réel"
        icon={DollarSign}
      />
    </div>
  );
}
