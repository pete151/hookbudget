"use client";

import Link from "next/link";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { cn } from "@/lib/utils/cn";
import type { NotificationView } from "@/services/notifications/notification.service";

/** Libellé de temps relatif simple (« il y a … »). */
function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(date),
  );
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: NotificationView;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onNavigate?: () => void;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">{notification.message}</p>
        <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" aria-label="Non lue" />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "group hover:bg-accent relative rounded-md p-2 transition-colors",
        !notification.isRead && "bg-accent/40",
      )}
    >
      {notification.actionUrl ? (
        <Link
          href={notification.actionUrl}
          onClick={() => {
            if (!notification.isRead) onMarkRead?.(notification.id);
            onNavigate?.();
          }}
        >
          {inner}
        </Link>
      ) : (
        inner
      )}

      {(onMarkRead || onDelete) && (
        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onMarkRead && !notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Marquer comme lue"
              onClick={() => onMarkRead(notification.id)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-6 w-6"
              aria-label="Supprimer"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
