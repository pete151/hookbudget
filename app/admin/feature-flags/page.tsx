import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/rbac";
import { listFeatureFlags } from "@/services/admin/feature-flag.service";
import { FeatureFlagCard } from "@/components/admin/feature-flag-card";

export const metadata: Metadata = { title: "Admin · Feature flags" };

export default async function AdminFeatureFlagsPage() {
  const admin = await requireAdmin("flags.view");
  const flags = await listFeatureFlags();
  const canManage = hasPermission(admin.adminRole, "flags.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature flags</h1>
        <p className="text-muted-foreground text-sm">
          Activez ou désactivez des fonctionnalités sans redéployer l&apos;application.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {flags.map((flag) => (
          <FeatureFlagCard key={flag.id} flag={flag} canManage={canManage} />
        ))}
      </div>
    </div>
  );
}
