// Fix broken data source URLs discovered in audit
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  // Fix 1: AZGFD bonus points URL — old path 404, remove from endpoints
  await db.execute(sql`
    UPDATE data_sources
    SET scraper_config = jsonb_set(
      scraper_config,
      '{endpoints}',
      (
        SELECT jsonb_agg(ep)
        FROM jsonb_array_elements(scraper_config->'endpoints') ep
        WHERE ep->>'path' NOT LIKE '%bonus-points%'
      )
    ),
    error_count = 0,
    last_error = NULL,
    status = 'active'
    WHERE name = 'AZGFD Draw Odds & Statistics'
    AND url = 'https://www.azgfd.com/hunting/hunt-draw-and-licenses/big-game-draw/'
  `);
  console.log("✅ Fixed AZGFD bonus-points 404 endpoint");

  // Fix 2: WGFD harvest — old /WGFD/SI/Hunting/ path is 404, update to current URL
  // Current WGFD harvest reports are at wgfd.wyo.gov/hunting/harvest-data
  await db.execute(sql`
    UPDATE data_sources
    SET scraper_config = jsonb_set(
      scraper_config,
      '{endpoints,0,path}',
      '"/hunting/harvest-data"'::jsonb
    ),
    error_count = 0,
    last_error = NULL,
    status = 'active'
    WHERE name = 'WGFD Harvest Reports'
    AND url = 'https://wgfd.wyo.gov/WGFD/SI/Hunting/Harvest-Reports/BigGame'
  `);
  console.log("✅ Fixed WGFD harvest URL");

  // Report final state
  const r = await db.execute(sql`
    SELECT name, status, error_count, url
    FROM data_sources
    WHERE name ILIKE '%AZGFD%' OR name ILIKE '%CPW%' OR name ILIKE '%WGFD%'
    ORDER BY name
  `);
  console.log("\n=== Updated source status ===");
  for (const row of r as Array<{ name: string; status: string; error_count: number; url: string }>) {
    const icon = row.error_count === 0 ? "✅" : "⚠️ ";
    console.log(`${icon} [${row.status}] ${row.name} (${row.error_count} errors)`);
  }

  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
