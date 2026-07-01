import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getPreferences } from "@/services/notifications/notification.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export const metadata: Metadata = {
  title: "Préférences de notifications",
};

/** Réglages des préférences de notifications. */
export default async function NotificationSettingsPage() {
  const user = await requireAuth();
  const preferences = await getPreferences(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/notifications">
          <ArrowLeft className="h-4 w-4" />
          Retour aux notifications
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Préférences de notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}
