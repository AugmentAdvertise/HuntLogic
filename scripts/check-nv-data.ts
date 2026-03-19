import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const nvRows = await db.execute(sql`SELECT id, code, name FROM states WHERE code = 'NV'`);
  const nv = (nvRows as Array<{ id: string; code: string; name: string }>)[0];
  if (!nv) { console.log("NV state not found"); process.exit(1); }

  console.log("State:", nv.code, nv.name, "id:", nv.id);

  const tables = ["draw_odds", "seasons", "deadlines", "harvest_stats"];
  for (const t of tables) {
    const r = await db.execute(sql.raw(`SELECT COUNT(*)::int as c FROM ${t} WHERE state_id = '${nv.id}'`));
    const row = (r as Array<{ c: number }>)[0];
    console.log(`  ${t}: ${row?.c ?? 0} rows`);
  }

  const regs = await db.execute(sql`SELECT title, doc_type, url FROM state_regulations WHERE state_id = ${nv.id}`);
  console.log(`\n  state_regulations: ${(regs as unknown[]).length} rows`);
  for (const r of regs as Array<{ title: string; doc_type: string; url: string }>) {
    console.log(`    - [${r.doc_type}] ${r.title}`);
    console.log(`      ${r.url}`);
  }

  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
