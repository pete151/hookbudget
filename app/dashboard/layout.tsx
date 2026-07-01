import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { requireAuth } from "@/lib/auth/server";
import { getUnreadNotifications } from "@/services/notifications/notification.service";

/**
 * Layout principal de l'espace applicatif (protégé).
 *
 * `requireAuth()` garantit, côté serveur, qu'une session valide existe
 * (défense en profondeur en complément du middleware) et fournit l'utilisateur
 * au header. L'appel rend ce layout dynamique : aucune requête base de données
 * n'a donc lieu au moment du build.
 *
 * Structure :
 *   ┌──────────┬───────────────────────────┐
 *   │          │  Header (sticky)          │
 *   │ Sidebar  ├───────────────────────────┤
 *   │ (lg+)    │  Contenu (children)       │
 *   └──────────┴───────────────────────────┘
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: user.name, email: user.email, image: user.image }}
          notifications={notifications}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
