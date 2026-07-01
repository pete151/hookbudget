import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfileSettingsPage() {
  const user = await requireAuth();
  const settings = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Vos informations personnelles.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm profile={settings.profile} />
      </CardContent>
    </Card>
  );
}
