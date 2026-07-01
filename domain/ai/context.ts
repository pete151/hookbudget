import type { FinancialContext } from "@/domain/ai/types";

/**
 * Mise en forme du contexte financier pour l'invite système de l'IA.
 *
 * Objectifs :
 *   - transmettre UNIQUEMENT des agrégats et libellés (aucune donnée sensible) ;
 *   - rester compact pour respecter les limites de tokens (les listes sont
 *     bornées en amont par le service qui construit le contexte).
 *
 * Fonctions pures : aucune I/O.
 */

function money(n: number, currency: string): string {
  return `${Math.round(n)} ${currency}`;
}

/** Sérialise le contexte financier en un bloc texte lisible par l'IA. */
export function formatContextForPrompt(ctx: FinancialContext): string {
  const c = ctx.currency;
  const lines: string[] = [];

  lines.push(`Données financières de ${ctx.displayName} (devise : ${c}).`);
  lines.push(`Générées le ${ctx.generatedAt}.`);
  lines.push("");

  lines.push("## Synthèse du mois");
  lines.push(`- Revenus du mois : ${money(ctx.summary.monthIncome, c)}`);
  lines.push(`- Dépenses du mois : ${money(ctx.summary.monthExpense, c)}`);
  lines.push(`- Solde du mois : ${money(ctx.summary.monthBalance, c)}`);
  lines.push(`- Solde total (tous mouvements) : ${money(ctx.summary.totalBalance, c)}`);
  lines.push(`- Épargne totale : ${money(ctx.summary.totalSavings, c)}`);
  lines.push(`- Taux d'épargne du mois : ${Math.round(ctx.summary.savingsRate)} %`);
  lines.push("");

  if (ctx.topExpenseCategories.length > 0) {
    lines.push("## Principales catégories de dépense");
    for (const cat of ctx.topExpenseCategories) {
      lines.push(`- ${cat.name} : ${money(cat.amount, c)} (${Math.round(cat.percent)} %)`);
    }
    lines.push("");
  }

  if (ctx.topIncomeCategories.length > 0) {
    lines.push("## Principales sources de revenus");
    for (const cat of ctx.topIncomeCategories) {
      lines.push(`- ${cat.name} : ${money(cat.amount, c)} (${Math.round(cat.percent)} %)`);
    }
    lines.push("");
  }

  if (ctx.budgets.length > 0) {
    lines.push("## Budgets");
    for (const b of ctx.budgets) {
      lines.push(
        `- ${b.name} : ${money(b.spent, c)} / ${money(b.amount, c)} consommé (${Math.round(b.percent)} %), reste ${money(b.remaining, c)}`,
      );
    }
    lines.push("");
  }

  if (ctx.goals.length > 0) {
    lines.push("## Objectifs d'épargne");
    for (const g of ctx.goals) {
      const deadline = g.monthsLeft != null ? `, ${g.monthsLeft} mois restants` : "";
      lines.push(
        `- ${g.name} : ${money(g.current, c)} / ${money(g.target, c)} (${Math.round(g.percent)} %${deadline})`,
      );
    }
    lines.push("");
  }

  if (ctx.monthly.length > 0) {
    lines.push("## Historique mensuel (revenus / dépenses / net)");
    for (const m of ctx.monthly) {
      lines.push(
        `- ${m.label} : ${money(m.income, c)} / ${money(m.expense, c)} / ${money(m.net, c)}`,
      );
    }
    lines.push("");
  }

  if (ctx.recentTransactions.length > 0) {
    lines.push("## Transactions récentes");
    for (const t of ctx.recentTransactions) {
      const sign = t.type === "income" ? "+" : "-";
      lines.push(`- ${t.date} ${t.title} [${t.category}] ${sign}${money(t.amount, c)}`);
    }
    lines.push("");
  }

  if (ctx.importantNotifications.length > 0) {
    lines.push("## Notifications importantes");
    for (const n of ctx.importantNotifications) {
      lines.push(`- ${n}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
