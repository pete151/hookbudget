import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportWizard } from "@/components/settings/import-wizard";
import { ExportDialog } from "@/components/settings/export-dialog";

export const metadata: Metadata = { title: "Import / Export" };

export default async function ImportExportSettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export du compte</CardTitle>
          <CardDescription>Sauvegardez toutes vos données.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import de transactions</CardTitle>
          <CardDescription>
            Importez un fichier CSV avec validation et simulation avant import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportWizard />
        </CardContent>
      </Card>
    </div>
  );
}
