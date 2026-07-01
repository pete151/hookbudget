import { describe, it, expect } from "vitest";

import { checkRateLimit } from "@/lib/security/rate-limit";

describe("lib/security/rate-limit — limitation de débit", () => {
  it("autorise jusqu'à la limite puis bloque", () => {
    const key = `test:${Math.random()}`;
    const opts = { limit: 3, windowMs: 1000 };

    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(true);

    const blocked = checkRateLimit(key, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("réinitialise après la fenêtre", async () => {
    const key = `test:${Math.random()}`;
    const opts = { limit: 1, windowMs: 30 };
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(checkRateLimit(key, opts).allowed).toBe(true);
  });

  it("isole les clés différentes", () => {
    const opts = { limit: 1, windowMs: 1000 };
    expect(checkRateLimit("k-a", opts).allowed).toBe(true);
    expect(checkRateLimit("k-b", opts).allowed).toBe(true);
  });
});
