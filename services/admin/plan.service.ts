import "server-only";

import { Prisma, type PlanTier } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/** Gestion des plans commerciaux (aucun paiement réel — préparation Sprint 15). */

export interface PlanView {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  currency: string;
  interval: string;
  maxBudgets: number | null;
  maxGoals: number | null;
  maxAiChats: number | null;
  features: string[];
  isActive: boolean;
  description: string | null;
}

function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function toView(p: {
  id: string;
  name: string;
  tier: PlanTier;
  price: Prisma.Decimal;
  currency: string;
  interval: string;
  maxBudgets: number | null;
  maxGoals: number | null;
  maxAiChats: number | null;
  features: string[];
  isActive: boolean;
  description: string | null;
}): PlanView {
  return { ...p, price: toNumber(p.price) };
}

/** Liste des plans (triés par prix croissant). */
export async function listPlans(): Promise<PlanView[]> {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  return plans.map(toView);
}

/** Un plan par identifiant. */
export async function getPlan(id: string): Promise<PlanView | null> {
  const plan = await prisma.plan.findUnique({ where: { id } });
  return plan ? toView(plan) : null;
}

export interface PlanUpsertInput {
  tier: PlanTier;
  name: string;
  price: number;
  currency: string;
  interval: string;
  maxBudgets: number | null;
  maxGoals: number | null;
  maxAiChats: number | null;
  features: string[];
  isActive: boolean;
  description?: string | null;
}

/** Crée ou met à jour un plan (clé = `tier`). */
export async function upsertPlan(data: PlanUpsertInput): Promise<void> {
  const payload = {
    name: data.name,
    price: new Prisma.Decimal(data.price),
    currency: data.currency,
    interval: data.interval,
    maxBudgets: data.maxBudgets,
    maxGoals: data.maxGoals,
    maxAiChats: data.maxAiChats,
    features: data.features,
    isActive: data.isActive,
    description: data.description ?? null,
  };
  await prisma.plan.upsert({
    where: { tier: data.tier },
    update: payload,
    create: { tier: data.tier, ...payload },
  });
}

/** Active / désactive un plan. */
export function setPlanActive(id: string, isActive: boolean) {
  return prisma.plan.update({ where: { id }, data: { isActive } });
}
