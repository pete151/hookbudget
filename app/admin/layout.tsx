import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/admin/auth";
import { permissionsFor, ADMIN_ROLE_LABELS } from "@/lib/admin/rbac";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

/**
 * Layout du Back Office — 100 % séparé de l'espace utilisateur.
 *
 * `requireAdmin()` (défense en profondeur, en complément du proxy) garantit un
 * rôle d'administration actif ; les non-admins sont redirigés vers `/dashboard`.
 * La navigation est filtrée selon les permissions du rôle.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const permissions = permissionsFor(admin.adminRole);

  return (
    <div className="flex min-h-full">
      <AdminSidebar permissions={permissions} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          user={{ name: admin.name, email: admin.email, image: admin.image }}
          roleLabel={ADMIN_ROLE_LABELS[admin.adminRole]}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
