import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drawOdds, huntUnits, species, states } from "@/lib/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";

interface SimulatorRequest {
  species: string[];
  states: string[];
  weapon: string;
  motivation: string;
  points: Record<string, number>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulatorRequest;

    const speciesSlugs = body.species ?? [];
    const stateCodes = body.states ?? [];
    const weapon = body.weapon ?? "any";

    if (speciesSlugs.length === 0 || stateCodes.length === 0) {
      return NextResponse.json(
        { error: "species and states are required" },
        { status: 400 }
      );
    }

    // Build where conditions
    const conditions = [
      inArray(species.slug, speciesSlugs),
      inArray(states.code, stateCodes),
      eq(drawOdds.residentType, "nonresident"),
    ];

    if (weapon !== "any") {
      conditions.push(eq(drawOdds.weaponType, weapon));
    }

    // Get the most recent year of data per state+species combo
    const results = await db
      .select({
        state: states.code,
        stateName: states.name,
        species: species.slug,
        speciesName: species.commonName,
        drawRate: drawOdds.drawRate,
        minPoints: drawOdds.minPointsDrawn,
        unit: huntUnits.unitCode,
        year: drawOdds.year,
        totalApplicants: drawOdds.totalApplicants,
        totalTags: drawOdds.totalTags,
      })
      .from(drawOdds)
      .innerJoin(states, eq(drawOdds.stateId, states.id))
      .innerJoin(species, eq(drawOdds.speciesId, species.id))
      .leftJoin(huntUnits, eq(drawOdds.huntUnitId, huntUnits.id))
      .where(and(...conditions))
      .orderBy(desc(drawOdds.drawRate))
      .limit(50);

    // Deduplicate: keep only the most recent year per state+species+unit
    const seen = new Set<string>();
    const deduped: typeof results = [];
    for (const row of results) {
      const key = `${row.state ?? ""}-${row.species ?? ""}-${row.unit ?? ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(row);
      }
    }

    const top = deduped.slice(0, 10);

    return NextResponse.json({
      results: top.map((r) => ({
        state: r.state ?? "",
        stateName: r.stateName ?? "",
        species: r.species ?? "",
        speciesName: r.speciesName ?? "",
        drawRate: r.drawRate ?? null,
        minPoints: r.minPoints ?? null,
        unit: r.unit ?? "Statewide",
        year: r.year ?? null,
        totalApplicants: r.totalApplicants ?? null,
        totalTags: r.totalTags ?? null,
      })),
      total: deduped.length,
    });
  } catch (error) {
    console.error("[draw-simulator/results] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate draw results" },
      { status: 500 }
    );
  }
}
