import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesForm } from "@/components/settings/preferences-form";

export const metadata: Metadata = { title: "Préférences" };

export default async function PreferencesSettingsPage() {
  const user = await requireAuth();
  const { preferences } = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
        <CardDescription>Formats d&apos;affichage et comportements par défaut.</CardDescription>
      </CardHeader>
      <CardContent>
        <PreferencesForm
          preferences={{
            firstDayOfWeek: preferences.firstDayOfWeek,
            dateFormat: preferences.dateFormat,
            numberFormat: preferences.numberFormat,
            decimalSeparator: preferences.decimalSeparator as "," | ".",
            defaultNotifications: preferences.defaultNotifications,
          }}
        />
      </CardContent>
    </Card>
  );
}
