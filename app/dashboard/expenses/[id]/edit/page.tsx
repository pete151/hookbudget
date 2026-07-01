import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { getExpenseById } from "@/services/expenses/expense.service";
import { getExpenseCategories } from "@/services/categories/categories.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditExpenseForm } from "@/components/expenses/edit-expense-form";

export const metadata: Metadata = {
  title: "Modifier la dépense",
};

/** Page d'édition d'une dépense. */
export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const [expense, categories] = await Promise.all([
    getExpenseById(user.id, id),
    getExpenseCategories(user.id),
  ]);

  if (!expense) notFound();

  const formCategories = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/expenses/${expense.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Retour à la dépense
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier la dépense</CardTitle>
        </CardHeader>
        <CardContent>
          <EditExpenseForm expense={expense} categories={formCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
