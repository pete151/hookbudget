import type { Metadata } from "next";
import { Search } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getAuditLogs } from "@/services/admin/audit.service";
import { AuditTable } from "@/components/admin/audit-table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Journal d'audit" };

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  await requireAdmin("audit.view");
  const sp = await searchParams;

  const { items, page, totalPages, total } = await getAuditLogs({
    action: sp.action || undefined,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal d&apos;audit</h1>
        <p className="text-muted-foreground text-sm">{total} entrée(s) enregistrée(s).</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="relative min-w-52 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                name="action"
                defaultValue={sp.action ?? ""}
                placeholder="Filtrer par action (ex. user.suspend)…"
                className="pl-9"
              />
            </div>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <AuditTable logs={items} />
          <AdminPagination page={page} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}
