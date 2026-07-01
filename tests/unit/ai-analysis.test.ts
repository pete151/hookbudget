import { describe, it, expect } from "vitest";

import {
  detectBudgetsAtRisk,
  detectCostlyCategories,
  detectExpenseSpike,
  detectSavingOpportunities,
  generateInsights,
} from "@/domain/ai/analysis";
import { makeContext } from "./fixtures";

describe("domain/ai/analysis — insights financiers", () => {
  it("détecte les budgets à risque et dépassés", () => {
    const cards = detectBudgetsAtRisk(makeContext());
    expect(cards.length).toBe(2);
    expect(cards.some((c) => c.severity === "danger")).toBe(true); // budget dépassé
  });

  it("signale une catégorie de dépense trop coûteuse", () => {
    const cards = detectCostlyCategories(makeContext());
    expect(cards.some((c) => c.title.includes("Loyer"))).toBe(true);
  });

  it("détecte une hausse inhabituelle des dépenses", () => {
    const cards = detectExpenseSpike(makeContext());
    expect(cards.length).toBe(1);
    expect(cards[0].type).toBe("ALERT");
  });

  it("détecte une opportunité d'épargne (solde positif, taux faible)", () => {
    const cards = detectSavingOpportunities(makeContext());
    expect(cards.length).toBe(1);
    expect(cards[0].type).toBe("OPPORTUNITY");
  });

  it("agrège et trie les insights (dangers en premier, max 8)", () => {
    const cards = generateInsights(makeContext());
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(8);
    expect(cards[0].severity).toBe("danger");
  });

  it("ne produit rien sans données", () => {
    const empty = makeContext({
      budgets: [],
      goals: [],
      topExpenseCategories: [],
      monthly: [],
      summary: {
        monthIncome: 0,
        monthExpense: 0,
        monthBalance: 0,
        totalBalance: 0,
        totalSavings: 0,
        savingsRate: 0,
      },
    });
    expect(generateInsights(empty).length).toBe(0);
  });
});
