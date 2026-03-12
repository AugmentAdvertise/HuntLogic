// =============================================================================
// Auth API v1 — Auth info and status
// =============================================================================
// Authentication is now handled by Auth.js via /api/auth/* routes.
// This route provides info about available auth methods.
// =============================================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// =============================================================================
// GET /api/v1/auth — Auth status and available methods
// =============================================================================

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    authenticated: !!session?.user?.id,
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          onboardingComplete: session.user.onboardingComplete,
        }
      : null,
    providers: {
      google: "POST /api/auth/signin/google",
      apple: "POST /api/auth/signin/apple",
      email: "POST /api/auth/signin/resend",
    },
    endpoints: {
      session: "GET /api/v1/auth/session",
      signout: "POST /api/v1/auth/signout",
      authjs: "/api/auth/* (handled by Auth.js)",
    },
  });
}
