import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import { getNotifications } from "@/services/notifications/notification.service";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export const metadata: Metadata = {
  title: "Notifications",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Centre de notifications (Server Component). */
export default async function NotificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const sp = await searchParams;

  const filter = one(sp.filter) ?? "all";
  const page = Number(one(sp.page) ?? "1") || 1;

  const result = await getNotifications(user.id, { filter, page, pageSize: 20 });

  return <NotificationsClient result={result} activeFilter={filter} />;
}
