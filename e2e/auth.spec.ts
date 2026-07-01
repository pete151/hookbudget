import { test, expect } from "@playwright/test";

/**
 * Parcours d'authentification (smoke E2E).
 * Vérifie l'accès aux pages publiques et la protection du dashboard.
 */

test.describe("Authentification", () => {
  test("la page de connexion s'affiche", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /connexion|se connecter/i })).toBeVisible();
  });

  test("la page d'inscription s'affiche", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
  });

  test("le dashboard redirige un visiteur non connecté vers /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("le back office redirige un visiteur non connecté vers /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
