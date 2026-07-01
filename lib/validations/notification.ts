import { z } from "zod";

/** Schéma des préférences de notifications (tous les champs sont des switches). */
export const notificationPreferenceSchema = z.object({
  budgetAlerts: z.boolean(),
  savingAlerts: z.boolean(),
  incomeAlerts: z.boolean(),
  expenseAlerts: z.boolean(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklySummary: z.boolean(),
  monthlySummary: z.boolean(),
});

export type NotificationPreferenceValues = z.infer<typeof notificationPreferenceSchema>;
