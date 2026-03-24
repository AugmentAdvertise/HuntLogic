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
  homeState?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulatorRequest;

    const speciesSlugs = body.species ?? [];
    const stateCodes = body.states ?? [];
    const weapon = body.weapon ?? "any";
    const homeState = body.homeState ?? null;

    if (speciesSlugs.length === 0 || stateCodes.length === 0) {
      return NextResponse.json(
        { error: "species and states are required" },
        { status: 400 }
      );
    }

    // Determine resident type per target state:
    // If the user's home state matches the target state → resident, else → nonresident.
    // We run one query per residency type, or use a single query and filter per state.
    // Simple approach: query both resident_types, then in JS pick the right row per state.
    const conditions = [
      inArray(species.slug, speciesSlugs),
      inArray(states.code, stateCodes),
      // Include both — we'll filter in JS based on homeState
    ];

    if (weapon !== "any") {
      conditions.push(eq(drawOdds.weaponType, weapon));
    }

    // Fetch both resident and nonresident rows — we'll pick the right one per state in JS
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
        residentType: drawOdds.residentType,
      })
      .from(drawOdds)
      .innerJoin(states, eq(drawOdds.stateId, states.id))
      .innerJoin(species, eq(drawOdds.speciesId, species.id))
      .leftJoin(huntUnits, eq(drawOdds.huntUnitId, huntUnits.id))
      .where(and(...conditions))
      .orderBy(desc(drawOdds.drawRate))
      .limit(200);

    // For each state+species+unit combo, pick the correct residency row:
    // - If homeState matches this target state → prefer "resident"
    // - Otherwise → prefer "nonresident"
    // Fall back to whichever row exists if the preferred type isn't available.
    type ResultRow = typeof results[number];
    const byKey = new Map<string, { resident?: ResultRow; nonresident?: ResultRow }>();

    for (const row of results) {
      const key = `${row.state ?? ""}-${row.species ?? ""}-${row.unit ?? ""}`;
      const entry = byKey.get(key) ?? {};
      if (row.residentType === "resident") {
        entry.resident = row;
      } else {
        entry.nonresident = row;
      }
      byKey.set(key, entry);
    }

    const deduped: ResultRow[] = [];
    for (const [, entry] of byKey) {
      const stateCode = entry.resident?.state ?? entry.nonresident?.state ?? "";
      const isResident = homeState !== null && homeState.toUpperCase() === stateCode.toUpperCase();
      const preferred = isResident
        ? (entry.resident ?? entry.nonresident)
        : (entry.nonresident ?? entry.resident);
      if (preferred) deduped.push(preferred);
    }

    // Sort by draw rate descending
    deduped.sort((a, b) => (b.drawRate ?? 0) - (a.drawRate ?? 0));

    const top = deduped.slice(0, 10);
    const residentLabel = (row: ResultRow) => {
      const stateCode = row.state ?? "";
      const isRes = homeState !== null && homeState.toUpperCase() === stateCode.toUpperCase();
      return isRes ? "resident" : "nonresident";
    };

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
        residentType: residentLabel(r),
      })),
      total: deduped.length,
      homeState: homeState ?? null,
    });
  } catch (error) {
    console.error("[draw-simulator/results] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate draw results" },
      { status: 500 }
    );
  }
}
