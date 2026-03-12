// =============================================================================
// Signout API — Signs user out and clears session
// =============================================================================

import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

// =============================================================================
// POST /api/v1/auth/signout — Sign out current user
// =============================================================================

export async function POST() {
  try {
    await signOut({ redirect: false });

    return NextResponse.json({
      success: true,
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("[auth/signout] POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to sign out" },
      { status: 500 }
    );
  }
}
