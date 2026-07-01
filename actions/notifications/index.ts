"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { notificationPreferenceSchema } from "@/lib/validations/notification";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  updatePreferences,
} from "@/services/notifications/notification.service";

/** Résultat standard d'une Server Action. */
export type ActionResult = { success: true } | { success: false; error: string };

function revalidateNotifications() {
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

/** Marque une notification comme lue. */
export async function markAsReadAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  await markAsRead(user.id, id);
  revalidateNotifications();
  return { success: true };
}

/** Marque toutes les notifications comme lues. */
export async function markAllAsReadAction(): Promise<ActionResult> {
  const user = await requireAuth();
  await markAllAsRead(user.id);
  revalidateNotifications();
  return { success: true };
}

/** Supprime une notification. */
export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  await deleteNotification(user.id, id);
  revalidateNotifications();
  return { success: true };
}

/** Supprime toutes les notifications lues. */
export async function deleteAllReadAction(): Promise<ActionResult> {
  const user = await requireAuth();
  await deleteAllRead(user.id);
  revalidateNotifications();
  return { success: true };
}

/** Met à jour les préférences de notifications. */
export async function updatePreferencesAction(values: unknown): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = notificationPreferenceSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  await updatePreferences(user.id, parsed.data);
  revalidatePath("/dashboard/settings/notifications");
  return { success: true };
}
