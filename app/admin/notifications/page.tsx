import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getSetting } from "@/services/admin/setting.service";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Notifications" };

export default async function AdminNotificationsPage() {
  await requireAdmin("notifications.manage");

  const [total, unread, systemMessage, maintenance] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    getSetting("system_message"),
    getSetting("maintenance_mode"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications système</h1>
        <p className="text-muted-foreground text-sm">
          Supervision des notifications et du message système global.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Notifications (total)" value={total} icon={Bell} />
        <StatCard label="Non lues" value={unread} />
        <StatCard
          label="Mode maintenance"
          value={maintenance === "true" ? "Activé" : "Désactivé"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message système (bandeau)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {systemMessage ? (
            <p className="bg-muted rounded-md p-3">{systemMessage}</p>
          ) : (
            <p className="text-muted-foreground">Aucun message système défini.</p>
          )}
          <p className="text-muted-foreground text-xs">
            Le message et le mode maintenance se modifient dans{" "}
            <Link href="/admin/settings" className="text-primary hover:underline">
              Paramètres
            </Link>
            . La diffusion push/e-mail est préparée pour le Sprint 15.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
