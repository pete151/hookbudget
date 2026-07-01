import { Skeleton } from "@/components/ui/skeleton";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { ChartSkeleton, StatCardSkeleton, TableSkeleton } from "@/components/dashboard/skeletons";

/**
 * UI de chargement du Dashboard (Next.js `loading.tsx`).
 * Affichée pendant la récupération serveur des données.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Cartes statistiques */}
      <DashboardGrid>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </DashboardGrid>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Transactions + latéral */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableSkeleton rows={6} />
        </div>
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}
