// Run: npx tsx scripts/check-migrations.ts
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const rows = await db.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );

  const tables: string[] = [];
  // postgres.js returns rows as array-like object
  for (const row of rows as Iterable<Record<string, unknown>>) {
    if (row.tablename) tables.push(row.tablename as string);
  }

  if (tables.length === 0) {
    console.error("No tables found — DB connection may be wrong");
    process.exit(1);
  }

  const expected = [
    "notifications",
    "notification_preferences",
    "hunt_groups",
    "hunt_group_members",
    "hunt_group_plans",
    "outfitters",
    "outfitter_reviews",
    "state_credentials",
    "auth_accounts",
    "verification_tokens",
    "state_regulations",
    "state_fee_schedules",
    "service_fee_config",
    "application_orders",
    "application_order_items",
    "payments",
    "refunds",
    "state_form_configs",
    "fulfillment_logs",
    "ops_users",
  ];

  console.log(`\nAll tables (${tables.length}):`);
  console.log(tables.join(", "));

  console.log("\n=== MIGRATION STATUS (Railway) ===");
  let missing = 0;
  for (const t of expected) {
    const ok = tables.includes(t);
    if (!ok) missing++;
    console.log((ok ? "✅" : "❌ MISSING") + " " + t);
  }
  console.log(
    `\n${missing === 0 ? "✅ All migrations applied" : `❌ ${missing} tables missing — run: npx drizzle-kit push`}`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
