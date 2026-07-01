"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authorizeAdmin } from "@/lib/admin/auth";
import { getRequestIp, type AdminActionResult } from "@/lib/admin/action";
import { recordAudit } from "@/services/admin/audit.service";
import { setFeatureFlag } from "@/services/admin/feature-flag.service";

/** Server Action — bascule d'un feature flag. */

const toggleSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  enabled: z.boolean(),
});

/** Active / désactive une fonctionnalité (sans redéploiement). */
export async function toggleFeatureFlagAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("flags.manage");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = toggleSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };

  await setFeatureFlag(parsed.data.id, parsed.data.enabled);
  await recordAudit({
    actorId: auth.admin.id,
    action: "flag.toggle",
    targetType: "FeatureFlag",
    targetId: parsed.data.key,
    metadata: { enabled: parsed.data.enabled },
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/feature-flags");
  return { success: true, data: undefined };
}
