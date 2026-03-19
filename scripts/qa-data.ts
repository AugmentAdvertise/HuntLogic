import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const tables = [
    "state_regulations",
    "outfitters",
    "outfitter_reviews",
    "hunt_groups",
    "hunt_group_members",
    "state_credentials",
    "notifications",
    "notification_preferences",
    "application_orders",
    "ops_users",
  ];

  console.log("=== ROW COUNTS (Railway) ===");
  for (const t of tables) {
    const r = await db.execute(sql.raw(`SELECT COUNT(*)::int as c FROM ${t}`));
    const row = (r as Array<{ c: number }>)[0];
    console.log(`  ${t}: ${row?.c ?? "?"}`);
  }

  // Check app_config tenant keys
  const cfg = await db.execute(
    sql`SELECT key, value FROM app_config WHERE key LIKE '%tenant%' OR key LIKE '%brand%' LIMIT 10`
  );
  console.log("\n=== app_config tenant/brand keys ===");
  for (const row of cfg as Array<{ key: string; value: unknown }>) {
    console.log(`  ${row.key}`);
  }

  // Check draw_odds count
  const odds = await db.execute(sql`SELECT COUNT(*)::int as c FROM draw_odds`);
  console.log(`\n  draw_odds: ${(odds as Array<{ c: number }>)[0]?.c}`);

  const deadlines = await db.execute(sql`SELECT COUNT(*)::int as c FROM deadlines`);
  console.log(`  deadlines: ${(deadlines as Array<{ c: number }>)[0]?.c}`);

  const seasons = await db.execute(sql`SELECT COUNT(*)::int as c FROM seasons`);
  console.log(`  seasons: ${(seasons as Array<{ c: number }>)[0]?.c}`);

  const users = await db.execute(sql`SELECT COUNT(*)::int as c FROM users`);
  console.log(`  users: ${(users as Array<{ c: number }>)[0]?.c}`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
