import { createAuthClient } from "better-auth/react";

/**
 * Client Better Auth (côté navigateur).
 *
 * Expose les méthodes appelées depuis les composants client :
 * `signIn`, `signUp`, `signOut`, `requestPasswordReset`, `resetPassword`,
 * ainsi que le hook réactif `useSession`.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
