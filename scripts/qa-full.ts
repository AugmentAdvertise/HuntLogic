import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  // draw_odds by state
  const byState = await db.execute(sql`
    SELECT s.code, COUNT(*)::int as c
    FROM draw_odds d JOIN states s ON s.id = d.state_id
    GROUP BY s.code ORDER BY c DESC
  `);
  console.log("\n=== draw_odds by state ===");
  for (const r of byState as Array<{ code: string; c: number }>) {
    console.log(`  ${r.code}: ${r.c}`);
  }

  // harvest_stats by state
  const hByState = await db.execute(sql`
    SELECT s.code, COUNT(*)::int as c
    FROM harvest_stats h JOIN states s ON s.id = h.state_id
    GROUP BY s.code ORDER BY c DESC
  `);
  console.log("\n=== harvest_stats by state ===");
  for (const r of hByState as Array<{ code: string; c: number }>) {
    console.log(`  ${r.code}: ${r.c}`);
  }

  // hunt_units by state
  const uByState = await db.execute(sql`
    SELECT s.code, COUNT(*)::int as c
    FROM hunt_units u JOIN states s ON s.id = u.state_id
    GROUP BY s.code ORDER BY c DESC
  `);
  console.log("\n=== hunt_units by state ===");
  for (const r of uByState as Array<{ code: string; c: number }>) {
    console.log(`  ${r.code}: ${r.c}`);
  }

  // NV draw_odds by species
  const nvSp = await db.execute(sql`
    SELECT sp.common_name, COUNT(*)::int as c
    FROM draw_odds d
    JOIN states s ON s.id = d.state_id
    JOIN species sp ON sp.id = d.species_id
    WHERE s.code = 'NV'
    GROUP BY sp.common_name ORDER BY c DESC
  `);
  console.log("\n=== NV draw_odds by species ===");
  for (const r of nvSp as Array<{ common_name: string; c: number }>) {
    console.log(`  ${r.common_name}: ${r.c}`);
  }

  // Total row counts
  const totals = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM draw_odds) as draw_odds,
      (SELECT COUNT(*)::int FROM harvest_stats) as harvest_stats,
      (SELECT COUNT(*)::int FROM hunt_units) as hunt_units,
      (SELECT COUNT(*)::int FROM deadlines) as deadlines,
      (SELECT COUNT(*)::int FROM seasons) as seasons,
      (SELECT COUNT(*)::int FROM state_regulations) as state_regulations,
      (SELECT COUNT(*)::int FROM outfitters) as outfitters,
      (SELECT COUNT(*)::int FROM users) as users,
      (SELECT COUNT(*)::int FROM notifications) as notifications
  `);
  const t = (totals as Array<Record<string, number>>)[0]!;
  console.log("\n=== TOTAL ROW COUNTS ===");
  for (const [k, v] of Object.entries(t)) {
    console.log(`  ${k}: ${v}`);
  }

  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
