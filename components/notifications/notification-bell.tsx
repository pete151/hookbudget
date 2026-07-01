"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "@/components/notifications/notification-item";
import { markAsReadAction, markAllAsReadAction } from "@/actions/notifications";
import type { NotificationView } from "@/services/notifications/notification.service";

/** Cloche de notifications avec compteur et panneau des dernières notifications. */
export function NotificationBell({
  items,
  unreadCount,
}: {
  items: NotificationView[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markAsReadAction(id);
      router.refresh();
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAsReadAction();
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications (${unreadCount} non lues)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border flex items-center justify-between border-b p-3">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleMarkAll}>
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-muted-foreground p-6 text-center text-sm">
            Aucune notification pour le moment.
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="p-1">
              {items.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-border border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard/notifications">Voir toutes les notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
