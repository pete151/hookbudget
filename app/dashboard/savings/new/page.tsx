import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewSavingGoalForm } from "@/components/savings/new-saving-goal-form";

export const metadata: Metadata = {
  title: "Nouvel objectif",
};

/** Page de création d'un objectif d'épargne. */
export default async function NewSavingGoalPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/savings">
          <ArrowLeft className="h-4 w-4" />
          Retour aux objectifs
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouvel objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <NewSavingGoalForm />
        </CardContent>
      </Card>
    </div>
  );
}
