import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppearanceSelector } from "@/components/settings/appearance-selector";

export const metadata: Metadata = { title: "Apparence" };

export default async function AppearanceSettingsPage() {
  const user = await requireAuth();
  const { preferences } = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisissez le thème de l&apos;interface.</CardDescription>
      </CardHeader>
      <CardContent>
        <AppearanceSelector current={preferences.theme} />
      </CardContent>
    </Card>
  );
}
