import { describe, it, expect } from "vitest";

import { hasPermission, permissionsFor, ROLE_PERMISSIONS } from "@/lib/admin/rbac";

describe("lib/admin/rbac — contrôle d'accès", () => {
  it("SUPER_ADMIN possède toutes les permissions", () => {
    expect(hasPermission("SUPER_ADMIN", "users.delete")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "settings.manage")).toBe(true);
  });

  it("ANALYST est en lecture seule (pas de suspension)", () => {
    expect(hasPermission("ANALYST", "analytics.view")).toBe(true);
    expect(hasPermission("ANALYST", "users.suspend")).toBe(false);
  });

  it("SUPPORT ne peut ni supprimer ni gérer les paramètres", () => {
    expect(hasPermission("SUPPORT", "users.suspend")).toBe(true);
    expect(hasPermission("SUPPORT", "users.delete")).toBe(false);
    expect(hasPermission("SUPPORT", "settings.manage")).toBe(false);
  });

  it("ADMIN ne peut pas supprimer d'utilisateur ni modifier les paramètres critiques", () => {
    expect(hasPermission("ADMIN", "users.delete")).toBe(false);
    expect(hasPermission("ADMIN", "settings.manage")).toBe(false);
    expect(hasPermission("ADMIN", "plans.manage")).toBe(true);
  });

  it("un rôle absent ne détient aucune permission", () => {
    expect(hasPermission(null, "users.view")).toBe(false);
  });

  it("permissionsFor renvoie une liste non vide", () => {
    expect(permissionsFor("ADMIN").length).toBeGreaterThan(0);
    expect(ROLE_PERMISSIONS.SUPER_ADMIN.length).toBeGreaterThan(ROLE_PERMISSIONS.SUPPORT.length);
  });
});
