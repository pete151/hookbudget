import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelector } from "@/components/settings/currency-selector";

export const metadata: Metadata = { title: "Devise" };

export default async function CurrencySettingsPage() {
  const user = await requireAuth();
  const { preferences } = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devise</CardTitle>
        <CardDescription>
          Devise utilisée pour l&apos;ensemble de l&apos;application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CurrencySelector current={preferences.currency} />
      </CardContent>
    </Card>
  );
}
