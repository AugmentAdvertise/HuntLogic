import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { species } from "@/lib/db/schema/hunting";

/**
 * GET /api/v1/species — List all enabled species
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        slug: species.slug,
        name: species.commonName,
        category: species.category,
      })
      .from(species)
      .where(eq(species.enabled, true))
      .orderBy(species.commonName);

    return NextResponse.json({ species: rows });
  } catch (error) {
    console.error("[species] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}
