import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getBudgetById } from "@/services/budgets/budget.service";
import { getExpenseCategories } from "@/services/categories/categories.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditBudgetForm } from "@/components/budgets/edit-budget-form";

export const metadata: Metadata = {
  title: "Modifier le budget",
};

/** Page d'édition d'un budget. */
export default async function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const [budget, categories] = await Promise.all([
    getBudgetById(user.id, id),
    getExpenseCategories(user.id),
  ]);

  if (!budget) notFound();

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/budgets/${budget.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Retour au budget
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le budget</CardTitle>
        </CardHeader>
        <CardContent>
          <EditBudgetForm budget={budget} categories={formCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
