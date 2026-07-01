import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/rbac";
import { getUserProfile } from "@/services/admin/user.service";
import { formatDate } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin · Profil utilisateur" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("users.view");
  const { id } = await params;
  const user = await getUserProfile(id);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Retour">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Statut">
              <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                {user.status === "ACTIVE" ? "Actif" : "Suspendu"}
              </Badge>
            </Row>
            <Row label="Rôle">
              <Badge variant={user.adminRole ? "default" : "secondary"}>
                {user.adminRole ? ADMIN_ROLE_LABELS[user.adminRole] : "Utilisateur"}
              </Badge>
            </Row>
            <Row label="Plan">
              <Badge variant="outline">{user.plan}</Badge>
            </Row>
            <Row label="Inscrit le">{formatDate(user.createdAt)}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Revenus enregistrés">{user.counts.incomes}</Row>
            <Row label="Dépenses enregistrées">{user.counts.expenses}</Row>
            <Row label="Budgets">{user.counts.budgets}</Row>
            <Row label="Objectifs d'épargne">{user.counts.goals}</Row>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique d&apos;abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          {user.history.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun événement d&apos;abonnement.</p>
          ) : (
            <ul className="divide-border divide-y">
              {user.history.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <Badge variant="outline" className="mr-2">
                      {h.plan}
                    </Badge>
                    {h.event}
                  </span>
                  <span className="text-muted-foreground text-xs">{formatDate(h.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
