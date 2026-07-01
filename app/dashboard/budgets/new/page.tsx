import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getExpenseCategories } from "@/services/categories/categories.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewBudgetForm } from "@/components/budgets/new-budget-form";

export const metadata: Metadata = {
  title: "Nouveau budget",
};

/** Page de création d'un budget. */
export default async function NewBudgetPage() {
  const user = await requireAuth();
  const categories = await getExpenseCategories(user.id);
  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/budgets">
          <ArrowLeft className="h-4 w-4" />
          Retour aux budgets
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau budget</CardTitle>
        </CardHeader>
        <CardContent>
          <NewBudgetForm categories={formCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
