import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const r = await db.execute(
    sql`SELECT id, slug, common_name FROM species ORDER BY common_name`
  );
  for (const row of r) {
    console.log(JSON.stringify(row));
  }

  const states = await db.execute(
    sql`SELECT id, code, name FROM states WHERE code = 'NV'`
  );
  console.log("NV STATE:", JSON.stringify(states[0]));

  process.exit(0);
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
