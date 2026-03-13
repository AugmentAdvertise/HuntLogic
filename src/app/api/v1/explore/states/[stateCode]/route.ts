import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { states, species, stateSpecies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stateCode: string }> }
) {
  try {
    const { stateCode } = await params;

    const state = await db.query.states.findFirst({
      where: eq(states.code, stateCode.toUpperCase()),
    });

    if (!state) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    const speciesData = await db
      .select({
        stateCode: states.code,
        stateName: states.name,
        speciesSlug: species.slug,
        speciesName: species.commonName,
        hasDraw: stateSpecies.hasDraw,
        hasOtc: stateSpecies.hasOtc,
        hasPoints: stateSpecies.hasPoints,
        pointType: stateSpecies.pointType,
        huntTypes: stateSpecies.huntTypes,
      })
      .from(stateSpecies)
      .innerJoin(states, eq(stateSpecies.stateId, states.id))
      .innerJoin(species, eq(stateSpecies.speciesId, species.id))
      .where(eq(stateSpecies.stateId, state.id));

    return NextResponse.json({
      state: {
        code: state.code,
        name: state.name,
        region: state.region,
        agencyName: state.agencyName,
        agencyUrl: state.agencyUrl,
      },
      species: speciesData,
    });
  } catch (error) {
    console.error("[explore/states/detail] Error:", error);
    return NextResponse.json({ error: "Failed to load state details" }, { status: 500 });
  }
}
