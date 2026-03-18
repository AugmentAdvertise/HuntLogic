import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { huntUnits, states, species } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Public endpoint — hunt unit boundaries are publicly viewable

  const stateCode = request.nextUrl.searchParams.get("state");
  const speciesSlug = request.nextUrl.searchParams.get("species");

  try {
    let stateId: string | undefined;
    let speciesId: string | undefined;

    if (stateCode) {
      const stateRow = await db.query.states.findFirst({
        where: eq(states.code, stateCode),
        columns: { id: true },
      });
      stateId = stateRow?.id;
    }

    if (speciesSlug) {
      const speciesRow = await db.query.species.findFirst({
        where: eq(species.slug, speciesSlug),
        columns: { id: true },
      });
      speciesId = speciesRow?.id;
    }

    // Build conditions
    const conditions = [eq(huntUnits.enabled, true)];
    if (stateId) conditions.push(eq(huntUnits.stateId, stateId));
    if (speciesId) conditions.push(eq(huntUnits.speciesId, speciesId));

    const rows = await db
      .select({
        unitCode: huntUnits.unitCode,
        publicLandPct: huntUnits.publicLandPct,
        terrainClass: huntUnits.terrainClass,
        elevationMin: huntUnits.elevationMin,
        elevationMax: huntUnits.elevationMax,
        accessNotes: huntUnits.accessNotes,
        config: huntUnits.config,
        stateCode: states.code,
        speciesSlug: species.slug,
        speciesName: species.commonName,
      })
      .from(huntUnits)
      .innerJoin(states, eq(huntUnits.stateId, states.id))
      .innerJoin(species, eq(huntUnits.speciesId, species.id))
      .where(and(...conditions))
      .limit(500);

    // Group by unit code and aggregate species
    const unitMap = new Map<
      string,
      {
        unitCode: string;
        publicLandPct: number | null;
        terrainClass: string | null;
        elevationMin: number | null;
        elevationMax: number | null;
        accessNotes: string | null;
        species: string[];
        lat: number | null;
        lng: number | null;
        stateCode: string;
      }
    >();

    for (const row of rows) {
      const key = `${row.stateCode}_${row.unitCode}`;
      const cfg = row.config as Record<string, unknown> | null;

      if (unitMap.has(key)) {
        const existing = unitMap.get(key)!;
        if (!existing.species.includes(row.speciesName)) {
          existing.species.push(row.speciesName);
        }
      } else {
        unitMap.set(key, {
          unitCode: row.unitCode,
          publicLandPct: row.publicLandPct,
          terrainClass: row.terrainClass,
          elevationMin: row.elevationMin,
          elevationMax: row.elevationMax,
          accessNotes: row.accessNotes,
          species: [row.speciesName],
          lat: (cfg?.lat as number) ?? null,
          lng: (cfg?.lng as number) ?? null,
          stateCode: row.stateCode,
        });
      }
    }

    return NextResponse.json({ units: Array.from(unitMap.values()) });
  } catch (error) {
    console.error("[api/map/units] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch map units" },
      { status: 500 }
    );
  }
}
