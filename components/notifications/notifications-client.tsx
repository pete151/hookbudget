"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCheck, Trash2, ChevronLeft, ChevronRight, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationEmptyState } from "@/components/notifications/notification-empty-state";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { NOTIFICATION_TABS } from "@/lib/config/notification-config";
import {
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
  deleteAllReadAction,
} from "@/actions/notifications";
import type { NotificationListResult } from "@/services/notifications/notification.service";

/** Centre de notifications : onglets, liste paginée et actions. */
export function NotificationsClient({
  result,
  activeFilter,
}: {
  result: NotificationListResult;
  activeFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [confirmClear, setConfirmClear] = React.useState(false);

  function setFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function run(action: () => Promise<{ success: boolean; error?: string }>, okMessage: string) {
    startTransition(async () => {
      const res = await action();
      if (!res.success) {
        toast.error(res.error ?? "Une erreur est survenue.");
        return;
      }
      toast.success(okMessage);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {result.unreadCount > 0
              ? `${result.unreadCount} notification(s) non lue(s).`
              : "Vous êtes à jour."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings/notifications">
              <Settings className="h-4 w-4" />
              Préférences
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || result.unreadCount === 0}
            onClick={() => run(markAllAsReadAction, "Tout marqué comme lu")}
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={isPending}
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer les lues
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-border flex flex-wrap gap-2 border-b pb-2" role="tablist">
        {NOTIFICATION_TABS.map((tab) => {
          const active = activeFilter === tab.value;
          return (
            <Button
              key={tab.value}
              variant={active ? "secondary" : "ghost"}
              size="sm"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Liste */}
      {result.items.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <div className="space-y-1">
          {result.items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => run(() => markAsReadAction(id), "Marquée comme lue")}
              onDelete={(id) => run(() => deleteNotificationAction(id), "Notification supprimée")}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {result.page} sur {result.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => goToPage(result.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={result.page >= result.totalPages}
              onClick={() => goToPage(result.page + 1)}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation suppression des lues */}
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les notifications lues ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les notifications déjà lues seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setConfirmClear(false);
                run(deleteAllReadAction, "Notifications lues supprimées");
              }}
              disabled={isPending}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
