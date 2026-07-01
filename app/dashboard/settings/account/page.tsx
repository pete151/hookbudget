import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getSettings } from "@/services/settings/settings.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Compte" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

export default async function AccountSettingsPage() {
  const user = await requireAuth();
  const { account } = await getSettings(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compte</CardTitle>
        <CardDescription>Informations de votre compte HookBudget.</CardDescription>
      </CardHeader>
      <CardContent>
        <Row label="E-mail">{account.email}</Row>
        <Row label="Date d'inscription">{formatDate(account.createdAt)}</Row>
        <Row label="Plan actuel">
          <Badge variant="secondary">{account.plan}</Badge>
        </Row>
        <Row label="Statut du compte">
          <Badge variant="outline">{account.status}</Badge>
        </Row>
      </CardContent>
    </Card>
  );
}
