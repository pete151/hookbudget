"use client";

import { useEffect, useState } from "react";

/**
 * Indique si le composant est monté côté client.
 * Utile pour éviter les erreurs d'hydratation lorsqu'on rend du contenu
 * dépendant du navigateur (thème, date locale, etc.).
 *
 * Exemple de hook réutilisable pour démarrer le dossier `hooks/`.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Indique le montage côté client : ce setState au montage est volontaire.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
