import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Public endpoint — map boundaries are publicly viewable

  const stateCode = request.nextUrl.searchParams.get("state");

  try {
    // Check for cached boundary GeoJSON in documents table
    const conditions = [eq(documents.docType, "map_boundary")];
    if (stateCode) {
      conditions.push(eq(documents.title, `boundary_${stateCode}`));
    }

    const cached = await db
      .select({
        title: documents.title,
        content: documents.content,
      })
      .from(documents)
      .where(and(...conditions))
      .limit(stateCode ? 1 : 60);

    if (cached.length > 0) {
      const boundaries = cached.map((c) => ({
        stateCode: (c.title ?? "").replace("boundary_", ""),
        geojson: c.content ? JSON.parse(c.content) : null,
      }));

      return NextResponse.json({ boundaries });
    }

    // Return empty if no cached data exists
    return NextResponse.json({
      boundaries: [],
      message: "No boundary data cached. Run data ingestion to populate.",
    });
  } catch (error) {
    console.error("[api/map/boundaries] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch boundaries" },
      { status: 500 }
    );
  }
}
