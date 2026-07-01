import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/db/prisma";
import { generateWelcome } from "@/services/notifications/notification.service";

/**
 * Construit la configuration des fournisseurs sociaux.
 *
 * Les boutons Google / GitHub sont déjà présents dans l'UI, mais un fournisseur
 * n'est réellement activé QUE si ses variables d'environnement sont définies.
 * Cela permet de préparer le terrain sans casser le build quand les clés
 * ne sont pas encore configurées.
 */
function buildSocialProviders(): BetterAuthOptions["socialProviders"] {
  const providers: NonNullable<BetterAuthOptions["socialProviders"]> = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }

  return providers;
}

/**
 * Instance Better Auth (côté serveur) — source de vérité de l'authentification.
 *
 * - `database` : adaptateur Prisma sur PostgreSQL.
 * - `emailAndPassword` : inscription / connexion par e-mail + mot de passe.
 * - `sendResetPassword` : envoi du lien de réinitialisation. Aucun fournisseur
 *   d'e-mail n'étant configuré au Sprint 2, le lien est simplement journalisé
 *   en console (à remplacer par un envoi réel — Resend, etc. — plus tard).
 * - `socialProviders` : Google / GitHub, activés uniquement si les clés existent.
 * - `nextCookies()` : DOIT rester le dernier plugin pour gérer les cookies dans
 *   les Server Actions.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // Champs métier/préférences exposés dans la session (colonnes déjà présentes
  // dans le modèle Prisma `User`). Rend `user.currency`, `user.firstName`, etc.
  // disponibles côté serveur ET client.
  user: {
    additionalFields: {
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      currency: { type: "string", required: false, defaultValue: "XOF" },
      locale: { type: "string", required: false, defaultValue: "fr-FR" },
      timezone: { type: "string", required: false, defaultValue: "Africa/Abidjan" },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // TODO (sprint ultérieur) : envoyer un véritable e-mail.
      console.info(`[HookBudget] Lien de réinitialisation pour ${user.email} : ${url}`);
    },
  },
  socialProviders: buildSocialProviders(),
  // Déclencheur : notification de bienvenue à la fin de l'inscription.
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            await generateWelcome(createdUser.id);
          } catch (error) {
            console.error("[notifications] welcome failed:", error);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
