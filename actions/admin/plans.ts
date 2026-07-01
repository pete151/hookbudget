"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authorizeAdmin } from "@/lib/admin/auth";
import { getRequestIp, type AdminActionResult } from "@/lib/admin/action";
import { recordAudit } from "@/services/admin/audit.service";
import { setPlanActive, upsertPlan } from "@/services/admin/plan.service";

/** Server Actions — gestion des plans (aucun paiement réel). */

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().int().nonnegative().nullable(),
);

const upsertSchema = z.object({
  tier: z.enum(["FREE", "PRO", "BUSINESS", "ENTERPRISE"]),
  name: z.string().trim().min(1, "Le nom est requis.").max(60),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  currency: z.string().trim().min(1).max(8),
  interval: z.enum(["month", "year"]),
  maxBudgets: optionalInt,
  maxGoals: optionalInt,
  maxAiChats: optionalInt,
  features: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

const toggleSchema = z.object({ id: z.string().min(1), isActive: z.boolean() });

/** Crée ou met à jour un plan. */
export async function upsertPlanAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("plans.manage");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = upsertSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  await upsertPlan({
    tier: parsed.data.tier,
    name: parsed.data.name,
    price: parsed.data.price,
    currency: parsed.data.currency,
    interval: parsed.data.interval,
    maxBudgets: parsed.data.maxBudgets,
    maxGoals: parsed.data.maxGoals,
    maxAiChats: parsed.data.maxAiChats,
    features: parsed.data.features,
    isActive: parsed.data.isActive,
    description: parsed.data.description || null,
  });
  await recordAudit({
    actorId: auth.admin.id,
    action: "plan.upsert",
    targetType: "Plan",
    targetId: parsed.data.tier,
    metadata: { tier: parsed.data.tier, price: parsed.data.price },
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/plans");
  return { success: true, data: undefined };
}

/** Active / désactive un plan. */
export async function togglePlanAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("plans.manage");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = toggleSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };

  await setPlanActive(parsed.data.id, parsed.data.isActive);
  await recordAudit({
    actorId: auth.admin.id,
    action: "plan.toggle",
    targetType: "Plan",
    targetId: parsed.data.id,
    metadata: { isActive: parsed.data.isActive },
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/plans");
  return { success: true, data: undefined };
}
