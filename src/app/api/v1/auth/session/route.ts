// =============================================================================
// Session API — Returns current user session info
// =============================================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// =============================================================================
// GET /api/v1/auth/session — Current session info
// =============================================================================

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        onboardingComplete: session.user.onboardingComplete,
        onboardingStep: session.user.onboardingStep,
      },
    });
  } catch (error) {
    console.error("[auth/session] GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
