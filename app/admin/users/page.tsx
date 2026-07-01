import type { Metadata } from "next";
import { Search } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/rbac";
import { listUsers, type UserQuery } from "@/services/admin/user.service";
import { UsersTable } from "@/components/admin/users-table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin · Utilisateurs" };

type Search = {
  q?: string;
  status?: string;
  role?: string;
  sort?: string;
  page?: string;
};

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const admin = await requireAdmin("users.view");
  const sp = await searchParams;

  const query: UserQuery = {
    search: sp.q || undefined,
    status: sp.status === "ACTIVE" || sp.status === "SUSPENDED" ? sp.status : undefined,
    role:
      sp.role && ["USER", "SUPER_ADMIN", "ADMIN", "SUPPORT", "ANALYST"].includes(sp.role)
        ? (sp.role as UserQuery["role"])
        : undefined,
    sort: sp.sort === "oldest" || sp.sort === "name" ? sp.sort : "recent",
    page: sp.page ? Number(sp.page) : 1,
  };

  const { items, page, totalPages, total } = await listUsers(query);
  const role = admin.adminRole;
  const perms = {
    canSuspend: hasPermission(role, "users.suspend"),
    canDelete: hasPermission(role, "users.delete"),
    canRole: hasPermission(role, "users.role"),
    canAssignSuper: role === "SUPER_ADMIN",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground text-sm">{total} utilisateur(s) au total.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="relative min-w-52 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Rechercher (nom, e-mail)…"
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={sp.status ?? ""}
              className={SELECT_CLASS}
              aria-label="Statut"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="SUSPENDED">Suspendus</option>
            </select>
            <select
              name="role"
              defaultValue={sp.role ?? ""}
              className={SELECT_CLASS}
              aria-label="Rôle"
            >
              <option value="">Tous les rôles</option>
              <option value="USER">Utilisateurs</option>
              <option value="ANALYST">Analystes</option>
              <option value="SUPPORT">Support</option>
              <option value="ADMIN">Admins</option>
              <option value="SUPER_ADMIN">Super admins</option>
            </select>
            <select
              name="sort"
              defaultValue={sp.sort ?? "recent"}
              className={SELECT_CLASS}
              aria-label="Tri"
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="name">Nom (A→Z)</option>
            </select>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <UsersTable users={items} perms={perms} currentAdminId={admin.id} />
          <AdminPagination page={page} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}
