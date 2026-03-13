// =============================================================================
// PATCH /api/v1/recommendations/[id]/feedback — Submit feedback on a recommendation
//
// Accepts: { action: "save" | "dismiss" | "like" | "dislike" }
// Updates the recommendation status AND adjusts user preference weights
// so future recommendations better match the user's actual behavior.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processRecommendationFeedback } from "@/services/intelligence/feedback-engine";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["save", "dismiss", "like", "dislike"].includes(action)) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Must be one of: save, dismiss, like, dislike.",
        },
        { status: 400 }
      );
    }

    const result = await processRecommendationFeedback({
      userId: session.user.id,
      recommendationId: id,
      action,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action: result.action,
      adjustments: result.adjustments,
    });
  } catch (error) {
    console.error("[api/recommendations/feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}
