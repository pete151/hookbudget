import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/auth";

/**
 * Point d'entrée de l'API Better Auth.
 * Toutes les routes `/api/auth/*` (sign-in, sign-up, sign-out, callbacks
 * OAuth, reset password…) sont gérées par ce handler.
 */
export const { POST, GET } = toNextJsHandler(auth);
