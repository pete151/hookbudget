"use client";

import { useSession } from "@/lib/auth/auth-client";

/**
 * Hook client pratique pour accéder à l'utilisateur connecté.
 *
 * Encapsule `useSession` de Better Auth et expose un état clair :
 * `user`, `isAuthenticated`, `isPending`.
 */
export function useCurrentUser() {
  const { data, isPending, error } = useSession();

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isAuthenticated: Boolean(data?.user),
    isPending,
    error,
  };
}
