import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applicationHistory, states, species } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apps = await db
      .select({
        id: applicationHistory.id,
        stateId: applicationHistory.stateId,
        speciesId: applicationHistory.speciesId,
        huntUnitId: applicationHistory.huntUnitId,
        year: applicationHistory.year,
        choiceRank: applicationHistory.choiceRank,
        result: applicationHistory.result,
        tagType: applicationHistory.tagType,
        costPaid: applicationHistory.costPaid,
        createdAt: applicationHistory.createdAt,
        stateCode: states.code,
        stateName: states.name,
        speciesName: species.commonName,
      })
      .from(applicationHistory)
      .leftJoin(states, eq(applicationHistory.stateId, states.id))
      .leftJoin(species, eq(applicationHistory.speciesId, species.id))
      .where(eq(applicationHistory.userId, session.user.id))
      .orderBy(desc(applicationHistory.year), desc(applicationHistory.createdAt));

    return NextResponse.json({ applications: apps });
  } catch (error) {
    console.error("[api/applications] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stateId, speciesId, huntUnitId, year, choiceRank, result, tagType, costPaid } = body;

    if (!stateId || !speciesId || !year) {
      return NextResponse.json(
        { error: "stateId, speciesId, and year are required" },
        { status: 400 }
      );
    }

    // Check for existing entry for same user/state/species/year/choice
    const existing = await db
      .select()
      .from(applicationHistory)
      .where(
        and(
          eq(applicationHistory.userId, session.user.id),
          eq(applicationHistory.stateId, stateId),
          eq(applicationHistory.speciesId, speciesId),
          eq(applicationHistory.year, year)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(applicationHistory)
        .set({
          huntUnitId: huntUnitId ?? existing[0].huntUnitId,
          choiceRank: choiceRank ?? existing[0].choiceRank,
          result: result ?? existing[0].result,
          tagType: tagType ?? existing[0].tagType,
          costPaid: costPaid ?? existing[0].costPaid,
        })
        .where(eq(applicationHistory.id, existing[0].id))
        .returning();

      return NextResponse.json(updated);
    }

    // Create new
    const [entry] = await db
      .insert(applicationHistory)
      .values({
        userId: session.user.id,
        stateId,
        speciesId,
        huntUnitId,
        year,
        choiceRank,
        result: result ?? "not_started",
        tagType,
        costPaid,
      })
      .returning();

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[api/applications] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
