import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const r = await db.execute(sql`
    SELECT id, name, url, scraper_config, status, error_count, last_error, last_fetched
    FROM data_sources
    WHERE name ILIKE '%AZGFD%' OR name ILIKE '%CPW%' OR name ILIKE '%WGFD%'
    ORDER BY name
  `);
  
  for (const row of r as Array<{
    id: string; name: string; url: string;
    scraper_config: Record<string, unknown>; status: string;
    error_count: number; last_error: string; last_fetched: string;
  }>) {
    console.log(`\n--- ${row.name} ---`);
    console.log(`  url: ${row.url}`);
    console.log(`  status: ${row.status} | errors: ${row.error_count} | last_fetched: ${row.last_fetched ?? 'never'}`);
    console.log(`  scraper_config: ${JSON.stringify(row.scraper_config)}`);
    if (row.last_error) console.log(`  last_error: ${row.last_error}`);
  }
  
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
