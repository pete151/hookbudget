"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authorizeAdmin } from "@/lib/admin/auth";
import { getRequestIp, type AdminActionResult } from "@/lib/admin/action";
import { recordAudit } from "@/services/admin/audit.service";
import { setSettings } from "@/services/admin/setting.service";

/** Server Action — mise à jour des paramètres système. */

const updateSchema = z.object({
  entries: z
    .array(z.object({ key: z.string().min(1), value: z.string().max(2000) }))
    .min(1, "Aucun paramètre à mettre à jour."),
});

/** Met à jour un lot de paramètres système. */
export async function updateSettingsAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("settings.manage");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = updateSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  await setSettings(parsed.data.entries);
  await recordAudit({
    actorId: auth.admin.id,
    action: "settings.update",
    targetType: "SystemSetting",
    metadata: { keys: parsed.data.entries.map((e) => e.key) },
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/settings");
  return { success: true, data: undefined };
}
