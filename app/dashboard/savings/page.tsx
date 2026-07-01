import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth/server";
import {
  getSavingGoals,
  getSavingsStatistics,
  getSavingCharts,
} from "@/services/savings/saving.service";
import { SavingsClient } from "@/components/savings/savings-client";

export const metadata: Metadata = {
  title: "Objectifs d'épargne",
};

/** Page Objectifs d'épargne (Server Component). */
export default async function SavingsPage() {
  const user = await requireAuth();

  const [goals, stats, charts] = await Promise.all([
    getSavingGoals(user.id),
    getSavingsStatistics(user.id),
    getSavingCharts(user.id),
  ]);

  return (
    <SavingsClient goals={goals} stats={stats} charts={charts} currency={user.currency ?? "XOF"} />
  );
}
