import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getIncomeCategories } from "@/services/categories/categories.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewIncomeForm } from "@/components/income/new-income-form";

export const metadata: Metadata = {
  title: "Nouveau revenu",
};

/** Page de création d'un revenu. */
export default async function NewIncomePage() {
  const user = await requireAuth();
  const categories = await getIncomeCategories(user.id);
  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/income">
          <ArrowLeft className="h-4 w-4" />
          Retour aux revenus
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau revenu</CardTitle>
        </CardHeader>
        <CardContent>
          <NewIncomeForm categories={formCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
