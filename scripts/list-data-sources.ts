import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const r = await db.execute(sql`
    SELECT name, source_type, url, refresh_cadence, enabled, last_fetched, status,
           scraper_config->>'stateCode' as state_code
    FROM data_sources ORDER BY scraper_config->>'stateCode', name
  `);
  for (const row of r as Array<{
    name: string; source_type: string; url: string;
    refresh_cadence: string; enabled: boolean;
    last_fetched: string; status: string; state_code: string;
  }>) {
    const icon = row.enabled ? "✅" : "❌";
    console.log(`${row.state_code ?? "??"} | ${icon} | ${row.source_type} | ${row.refresh_cadence} | ${row.name}`);
    console.log(`   ${row.url ?? "(no url)"}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
