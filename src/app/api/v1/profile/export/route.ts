import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  hunterPreferences,
  pointHoldings,
  applicationHistory,
  harvestHistory,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const [profile, preferences, points, applications, harvests] =
      await Promise.all([
        db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            timezone: true,
            tier: true,
            onboardingComplete: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        db
          .select({
            category: hunterPreferences.category,
            key: hunterPreferences.key,
            value: hunterPreferences.value,
            source: hunterPreferences.source,
            createdAt: hunterPreferences.createdAt,
          })
          .from(hunterPreferences)
          .where(eq(hunterPreferences.userId, userId)),
        db
          .select({
            stateId: pointHoldings.stateId,
            speciesId: pointHoldings.speciesId,
            pointType: pointHoldings.pointType,
            points: pointHoldings.points,
            yearStarted: pointHoldings.yearStarted,
            verified: pointHoldings.verified,
          })
          .from(pointHoldings)
          .where(eq(pointHoldings.userId, userId)),
        db
          .select({
            stateId: applicationHistory.stateId,
            speciesId: applicationHistory.speciesId,
            year: applicationHistory.year,
            choiceRank: applicationHistory.choiceRank,
            result: applicationHistory.result,
            tagType: applicationHistory.tagType,
            costPaid: applicationHistory.costPaid,
          })
          .from(applicationHistory)
          .where(eq(applicationHistory.userId, userId)),
        db
          .select({
            stateId: harvestHistory.stateId,
            speciesId: harvestHistory.speciesId,
            year: harvestHistory.year,
            success: harvestHistory.success,
            weaponType: harvestHistory.weaponType,
            trophyScore: harvestHistory.trophyScore,
            notes: harvestHistory.notes,
          })
          .from(harvestHistory)
          .where(eq(harvestHistory.userId, userId)),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: profile ?? null,
      hunterPreferences: preferences,
      pointHoldings: points,
      applicationHistory: applications,
      harvestHistory: harvests,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="huntlogic-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("[api:profile/export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
