import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[api:profile/delete] Deleting account for userId=${userId}`);

    // Users table has no deletedAt column — hard delete.
    // Cascading deletes handle related records (preferences, points, history, etc.)
    await db.delete(users).where(eq(users.id, userId));

    console.log(`[api:profile/delete] Account deleted: userId=${userId}`);

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error("[api:profile/delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
