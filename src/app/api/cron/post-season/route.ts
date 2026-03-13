import { NextResponse } from "next/server";
import { scanEndedSeasons } from "@/services/feedback/post-season";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notificationsSent = await scanEndedSeasons();
    return NextResponse.json({
      success: true,
      notificationsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/post-season] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
