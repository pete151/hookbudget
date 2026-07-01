import type { MetadataRoute } from "next";

/** Manifeste PWA — rend HookBudget installable sur mobile/desktop. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HookBudget — Gestion de budget",
    short_name: "HookBudget",
    description:
      "Suivez vos revenus, dépenses, budgets et objectifs d'épargne, avec un assistant IA.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
