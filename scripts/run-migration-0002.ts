import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";

async function main() {
  const migrationSQL = readFileSync(
    "./src/lib/db/migrations/0002_add_state_regulations.sql",
    "utf8"
  );

  // Remove comment-only lines, split on semicolons
  const statements = migrationSQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => {
      const noComments = s.replace(/--[^\n]*/g, "").trim();
      return noComments.length > 5;
    });

  for (const stmt of statements) {
    const preview = stmt.replace(/--[^\n]*/g, "").trim().split("\n")[0]?.trim().substring(0, 70) ?? stmt.substring(0,70);
    try {
      await db.execute(sql.raw(stmt));
      console.log("✅ " + preview);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log("⚠️  " + preview + " → " + msg);
    }
  }

  console.log("\nDone");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
