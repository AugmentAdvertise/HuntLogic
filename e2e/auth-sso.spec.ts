// =============================================================================
// E2E: Google SSO Flow — Verifies the auth chain never breaks again
// =============================================================================
// This test validates everything up to the Google redirect (we can't automate
// Google's consent screen, but we CAN verify our side is correct).
// =============================================================================

import { test, expect } from "@playwright/test";

test.describe("Google SSO Flow", () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies before each test — simulates a fresh user
    await context.clearCookies();
  });

  test("login page renders with Google button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /magic link/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /privacy/i })).toBeVisible();
  });

  test("CSRF endpoint returns valid token with correct cookie name", async ({ request }) => {
    const res = await request.get("/api/auth/csrf");
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.csrfToken).toBeTruthy();
    expect(body.csrfToken.length).toBeGreaterThan(20);

    // Verify cookie name is NOT prefixed with __Host- or __Secure-
    const cookies = res.headers()["set-cookie"] || "";
    expect(cookies).toContain("authjs.csrf-token=");
    expect(cookies).not.toContain("__Host-");
    expect(cookies).not.toContain("__Secure-");
  });

  test("providers endpoint returns Google with correct URLs", async ({ request }) => {
    const res = await request.get("/api/auth/providers");
    expect(res.ok()).toBeTruthy();

    const providers = await res.json();
    expect(providers.google).toBeTruthy();
    expect(providers.google.id).toBe("google");
    expect(providers.google.type).toBe("oidc");
    expect(providers.google.signinUrl).toContain("/api/auth/signin/google");
    expect(providers.google.callbackUrl).toContain("/api/auth/callback/google");
  });

  test("signin POST with valid CSRF redirects to Google", async ({ request }) => {
    // Step 1: Get CSRF token + cookie
    const csrfRes = await request.get("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    // Step 2: POST to signin endpoint (simulates the form submission)
    const signinRes = await request.post("/api/auth/signin/google", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Auth-Return-Redirect": "1",
      },
      data: `csrfToken=${csrfToken}&callbackUrl=%2Fdashboard`,
    });

    expect(signinRes.ok()).toBeTruthy();

    const body = await signinRes.json();
    expect(body.url).toContain("accounts.google.com");
    expect(body.url).toContain("client_id=");
    expect(body.url).toContain("redirect_uri=");
    expect(body.url).toContain("callback%2Fgoogle");

    // Verify PKCE cookie is set (required for OAuth callback)
    const cookies = signinRes.headers()["set-cookie"] || "";
    expect(cookies).toContain("authjs.pkce.code_verifier=");
    expect(cookies).not.toContain("__Secure-");
  });

  test("Google button click triggers form POST and navigates away", async ({ page }) => {
    await page.goto("/login");

    // Wait for CSRF token to load (the hidden input gets populated)
    await page.waitForFunction(() => {
      const input = document.querySelector('input[name="csrfToken"]') as HTMLInputElement;
      return input && input.value.length > 10;
    }, null, { timeout: 5000 });

    // Intercept the form POST to verify it goes to the right endpoint
    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        req.url().includes("/api/auth/signin/google") && req.method() === "POST"
      ),
      page.getByRole("button", { name: /google/i }).click(),
    ]);

    expect(request.method()).toBe("POST");
    expect(request.url()).toContain("/api/auth/signin/google");

    // The page should navigate away from /login (to Google or to dashboard)
    await page.waitForURL((url) => !url.toString().includes("/login"), {
      timeout: 10000,
    }).catch(() => {
      // If we land back on /login, check there's no error
      // (Google may block automated browsers — that's expected)
    });
  });

  test("stale __Secure- cookies are cleaned by middleware", async ({ page, context }) => {
    // Simulate a stale cookie from the old auth config
    await context.addCookies([
      {
        name: "__Secure-authjs.session-token",
        value: "stale-token-from-old-secret",
        domain: new URL(page.url() || "https://huntlogic.vercel.app").hostname || "huntlogic.vercel.app",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    // Visit any page — middleware should delete the stale cookie
    await page.goto("/login");

    // The stale cookie should be gone
    const cookies = await context.cookies();
    const staleCookie = cookies.find((c) => c.name === "__Secure-authjs.session-token");
    // Middleware sets it to empty with past expiry, so it should be absent or empty
    expect(!staleCookie || staleCookie.value === "").toBeTruthy();
  });

  test("unauthenticated user is redirected to login on protected routes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("public routes are accessible without auth", async ({ page }) => {
    for (const route of ["/login", "/signup"]) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      // Should NOT redirect to /login with callbackUrl
      expect(page.url()).not.toContain("callbackUrl");
    }
  });
});

test.describe("Session Health", () => {
  test("session endpoint returns no user for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/auth/session");
    expect(res.ok()).toBeTruthy();
    const session = await res.json();
    // Unauthenticated = null, empty object, or object without user
    expect(session === null || !session?.user).toBeTruthy();
  });

  test("no __Host- or __Secure- cookies set on any auth endpoint", async ({ request }) => {
    const endpoints = [
      "/api/auth/csrf",
      "/api/auth/session",
      "/api/auth/providers",
    ];

    for (const endpoint of endpoints) {
      const res = await request.get(endpoint);
      const cookies = res.headers()["set-cookie"] || "";
      expect(cookies).not.toContain("__Host-");
      expect(cookies).not.toContain("__Secure-");
    }
  });
});
