import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Configuration Vitest (Sprint 15) — tests unitaires/intégration de la logique
 * pure (domaine, RBAC, sécurité). Les tests End-to-End sont gérés par Playwright.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: true,
    reporters: "default",
  },
});
