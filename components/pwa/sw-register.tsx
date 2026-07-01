"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker (PWA) — UNIQUEMENT en production, pour éviter
 * toute mise en cache gênante en développement.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
