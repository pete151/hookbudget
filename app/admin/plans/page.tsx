import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/rbac";
import { listPlans } from "@/services/admin/plan.service";
import { PlansTable } from "@/components/admin/plans-table";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Plans" };

export default async function AdminPlansPage() {
  const admin = await requireAdmin("plans.view");
  const plans = await listPlans();
  const canManage = hasPermission(admin.adminRole, "plans.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
        <p className="text-muted-foreground text-sm">
          Offres commerciales (aucun paiement réel — préparation Sprint 15).
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <PlansTable plans={plans} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
