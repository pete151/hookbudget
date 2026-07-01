import type { Metadata } from "next";
import { headers } from "next/headers";

import { requireAuth } from "@/lib/auth/server";
import { auth } from "@/lib/auth/auth";
import { SecurityCard } from "@/components/settings/security-card";
import type { SessionInfo } from "@/components/settings/sessions-list";

export const metadata: Metadata = { title: "Sécurité" };

export default async function SecuritySettingsPage() {
  await requireAuth();
  const h = await headers();

  const [current, list] = await Promise.all([
    auth.api.getSession({ headers: h }),
    auth.api.listSessions({ headers: h }).catch(() => [] as unknown[]),
  ]);

  const currentToken = current?.session.token;
  const sessions: SessionInfo[] = (
    list as {
      id: string;
      token: string;
      userAgent?: string | null;
      ipAddress?: string | null;
      createdAt: Date;
    }[]
  ).map((s) => ({
    id: s.id,
    current: s.token === currentToken,
    userAgent: s.userAgent ?? null,
    ipAddress: s.ipAddress ?? null,
    createdAt: new Date(s.createdAt),
  }));

  // La session courante en premier.
  sessions.sort((a, b) => Number(b.current) - Number(a.current));

  return <SecurityCard sessions={sessions} />;
}
