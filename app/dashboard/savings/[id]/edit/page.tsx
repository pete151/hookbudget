import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getSavingGoalById } from "@/services/savings/saving.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditSavingGoalForm } from "@/components/savings/edit-saving-goal-form";

export const metadata: Metadata = {
  title: "Modifier l'objectif",
};

/** Page d'édition d'un objectif d'épargne. */
export default async function EditSavingGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const goal = await getSavingGoalById(user.id, id);

  if (!goal) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/savings/${goal.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;objectif
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier l&apos;objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <EditSavingGoalForm goal={goal} />
        </CardContent>
      </Card>
    </div>
  );
}
