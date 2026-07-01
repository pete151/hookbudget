import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from "@/components/settings/language-selector";

export const metadata: Metadata = { title: "Langue" };

export default async function LanguageSettingsPage() {
  const user = await requireAuth();
  const { preferences } = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Langue</CardTitle>
        <CardDescription>
          Langue de l&apos;interface. Le système est extensible (i18n préparé).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LanguageSelector current={preferences.language} />
      </CardContent>
    </Card>
  );
}
