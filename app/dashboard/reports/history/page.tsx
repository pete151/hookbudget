import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getReportHistory } from "@/services/reports/report.service";
import { Button } from "@/components/ui/button";
import { ReportHistory } from "@/components/reports/report-history";

export const metadata: Metadata = {
  title: "Historique des rapports",
};

/** Historique des rapports générés. */
export default async function ReportHistoryPage() {
  const user = await requireAuth();
  const items = await getReportHistory(user.id);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/reports">
          <ArrowLeft className="h-4 w-4" />
          Retour aux rapports
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historique des rapports</h1>
        <p className="text-muted-foreground text-sm">
          Retrouvez et re-téléchargez vos rapports exportés.
        </p>
      </div>

      <ReportHistory items={items} />
    </div>
  );
}
