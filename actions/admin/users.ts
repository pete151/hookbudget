"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminRole } from "@prisma/client";

import { authorizeAdmin } from "@/lib/admin/auth";
import { getRequestIp, type AdminActionResult } from "@/lib/admin/action";
import { recordAudit } from "@/services/admin/audit.service";
import { setUserRole, setUserStatus, softDeleteUser } from "@/services/admin/user.service";

/**
 * Server Actions — gestion des utilisateurs (Back Office).
 * Chaque action sensible : vérifie la permission puis journalise l'audit.
 */

const idSchema = z.object({ userId: z.string().min(1) });
const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT", "ANALYST", "USER"]),
});

/** Suspend un utilisateur. */
export async function suspendUserAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("users.suspend");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = idSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };
  if (parsed.data.userId === auth.admin.id) {
    return { success: false, error: "Vous ne pouvez pas vous suspendre vous-même." };
  }

  await setUserStatus(parsed.data.userId, "SUSPENDED");
  await recordAudit({
    actorId: auth.admin.id,
    action: "user.suspend",
    targetType: "User",
    targetId: parsed.data.userId,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { success: true, data: undefined };
}

/** Réactive un utilisateur. */
export async function reactivateUserAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("users.suspend");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = idSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };

  await setUserStatus(parsed.data.userId, "ACTIVE");
  await recordAudit({
    actorId: auth.admin.id,
    action: "user.reactivate",
    targetType: "User",
    targetId: parsed.data.userId,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { success: true, data: undefined };
}

/** Supprime (soft delete) un utilisateur. */
export async function deleteUserAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("users.delete");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = idSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };
  if (parsed.data.userId === auth.admin.id) {
    return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  await softDeleteUser(parsed.data.userId);
  await recordAudit({
    actorId: auth.admin.id,
    action: "user.delete",
    targetType: "User",
    targetId: parsed.data.userId,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

/** Change le rôle d'administration d'un utilisateur (`USER` = rétrograder). */
export async function changeUserRoleAction(values: unknown): Promise<AdminActionResult> {
  const auth = await authorizeAdmin("users.role");
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = roleSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Données invalides." };
  if (parsed.data.userId === auth.admin.id) {
    return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
  }
  // Seul un SUPER_ADMIN peut créer un autre SUPER_ADMIN.
  if (parsed.data.role === "SUPER_ADMIN" && auth.admin.adminRole !== "SUPER_ADMIN") {
    return { success: false, error: "Seul un super administrateur peut attribuer ce rôle." };
  }

  const newRole = parsed.data.role === "USER" ? null : (parsed.data.role as AdminRole);
  await setUserRole(parsed.data.userId, newRole);
  await recordAudit({
    actorId: auth.admin.id,
    action: "user.role_change",
    targetType: "User",
    targetId: parsed.data.userId,
    metadata: { role: parsed.data.role },
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { success: true, data: undefined };
}
