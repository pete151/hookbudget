import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/rbac";
import { listSystemSettings } from "@/services/admin/setting.service";
import { SystemSettingsForm } from "@/components/admin/system-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Paramètres système" };

export default async function AdminSettingsPage() {
  const admin = await requireAdmin("settings.view");
  const settings = await listSystemSettings();
  const canManage = hasPermission(admin.adminRole, "settings.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres système</h1>
        <p className="text-muted-foreground text-sm">
          Nom de l&apos;application, logo, maintenance, messages et variables métier.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription>
            {canManage
              ? "Modifiez les paramètres puis enregistrez."
              : "Lecture seule (permission de modification requise)."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemSettingsForm settings={settings} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
