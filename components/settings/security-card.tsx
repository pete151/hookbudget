import { KeyRound, ShieldCheck, History } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SessionsList, type SessionInfo } from "@/components/settings/sessions-list";

/** Regroupe les réglages de sécurité (mot de passe, sessions, 2FA, historique). */
export function SecurityCard({ sessions }: { sessions: SessionInfo[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Mot de passe
          </CardTitle>
          <CardDescription>Modifiez votre mot de passe régulièrement.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions actives</CardTitle>
          <CardDescription>Appareils actuellement connectés à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList sessions={sessions} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Double authentification (2FA)
              <Badge variant="outline">Bientôt</Badge>
            </CardTitle>
            <CardDescription>
              L&apos;infrastructure est prête ; l&apos;activation arrivera dans un prochain sprint.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Historique des connexions
              <Badge variant="outline">Bientôt</Badge>
            </CardTitle>
            <CardDescription>
              La structure de journalisation est prête pour un affichage détaillé ultérieur.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
