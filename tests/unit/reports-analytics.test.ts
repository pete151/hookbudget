import { describe, it, expect } from "vitest";

import { computeSummary, withPercent, buildCashFlow } from "@/domain/reports/analytics";

describe("domain/reports/analytics — calculs financiers purs", () => {
  it("calcule le solde et le taux d'épargne", () => {
    const s = computeSummary(1000, 600, 200);
    expect(s.balance).toBe(400);
    expect(s.savingsRate).toBe(20);
  });

  it("gère un revenu nul (taux d'épargne = 0)", () => {
    expect(computeSummary(0, 100, 0).savingsRate).toBe(0);
  });

  it("calcule les pourcentages par tranche et trie", () => {
    const slices = withPercent([
      { name: "A", color: "#000", value: 30 },
      { name: "B", color: "#111", value: 70 },
    ]);
    expect(slices[0].name).toBe("B");
    expect(slices[0].percent).toBe(70);
  });

  it("construit un flux de trésorerie net", () => {
    const flow = buildCashFlow([{ label: "janv.", income: 100, expense: 40 }]);
    expect(flow[0].net).toBe(60);
  });
});
