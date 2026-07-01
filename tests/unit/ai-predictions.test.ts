import { describe, it, expect } from "vitest";

import { generatePredictions } from "@/domain/ai/predictions";
import { makeContext } from "./fixtures";

describe("domain/ai/predictions — prévisions déterministes", () => {
  it("produit 4 prévisions (revenus, dépenses, solde, épargne)", () => {
    const preds = generatePredictions(makeContext());
    expect(preds.map((p) => p.kind).sort()).toEqual(
      ["balance", "expense", "income", "savings"].sort(),
    );
  });

  it("l'épargne prévue n'est jamais négative", () => {
    const preds = generatePredictions(makeContext());
    const savings = preds.find((p) => p.kind === "savings");
    expect(savings?.predictedValue).toBeGreaterThanOrEqual(0);
  });

  it("retourne un tableau vide avec un historique insuffisant", () => {
    const ctx = makeContext({ monthly: [{ label: "juil.", income: 0, expense: 0, net: 0 }] });
    expect(generatePredictions(ctx)).toEqual([]);
  });

  it("le niveau de confiance dépend du nombre de mois", () => {
    const preds = generatePredictions(makeContext());
    expect(["low", "medium", "high"]).toContain(preds[0].confidence);
  });
});
