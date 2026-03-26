/**
 * fix-deadline-dates-2026-round2.ts
 *
 * Round 2 corrections from expanded search (blogs, GoHunt, Huntin' Fool, eRegulations).
 * Verified 2026-03-25.
 *
 * NEW states added:
 *   KY — fw.ky.gov official: Opens Aug 1, deadline Apr 30, draw May 9
 *   PA — pa.gov official: Opens May 1, deadline Jul 12
 *
 * States corrected:
 *   UT — Huntin' Fool / UDWR: Opens Mar 19, deadline Apr 23, results May 31
 *   ID — huntinglicenseusa.com / IDFG: Controlled hunt deadline Jun 5 (not Apr 30)
 *   NM — Draw results expected Apr 22 (from huntinglicenseusa.com / NMDGF timeline)
 *
 * States confirmed NO hunt / removed:
 *   WV — HuntWise confirms "no open seasons for elk" in WV. No elk draw exists.
 *
 * States still unconfirmed (no 2026 dates published anywhere):
 *   CA, SD, VT, MN
 *
 * Run: DATABASE_URL=... npx tsx scripts/fix-deadline-dates-2026-round2.ts
 */

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log("=== Fix 2026 Deadline Dates — Round 2 ===\n");

  const stateRows = await sql`SELECT id, code FROM states`;
  const stateMap: Record<string, string> = {};
  for (const s of stateRows) stateMap[s.code] = s.id;

  const speciesRows = await sql`SELECT id, slug FROM species`;
  const speciesMap: Record<string, string> = {};
  for (const s of speciesRows) speciesMap[s.slug] = s.id;

  // ============================================================
  // 1. ADD KENTUCKY — Official fw.ky.gov
  //    Opens Aug 1, deadline Apr 30, draw May 9 at KY Elk & Outdoor Festival
  //    Source: fw.ky.gov/Hunt/pages/elk-hunting-regs.aspx
  //    Source: kyoutdoorfest.com (draw event May 9)
  //    Source: huntinglocator.com (confirms Apr 30 deadline)
  // ============================================================
  console.log("── KY: Adding verified elk draw dates ──");

  const kyStateId = stateMap["KY"];
  if (kyStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${kyStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old KY deadlines`);

    const kyDeadlines = [
      {
        title: "KY Elk Hunt Drawing Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2025-08-01",
        deadline_type: "application_open",
        description: "Kentucky Fish & Wildlife elk hunt drawing application period opens. KY has the largest elk herd east of the Mississippi (~14,000 animals). Apply at gooutdoorskentucky.com.",
        url: "https://fw.ky.gov/Hunt/pages/elk-hunting-regs.aspx",
        year: 2026,
      },
      {
        title: "KY Elk Hunt Drawing Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-04-30",
        deadline_type: "application_deadline",
        description: "Kentucky elk hunt drawing application deadline. No extensions, no exceptions. Apply at gooutdoorskentucky.com. Lottery-based for archery, crossbow, and firearm seasons.",
        url: "https://fw.ky.gov/Hunt/pages/elk-hunting-regs.aspx",
        year: 2026,
      },
      {
        title: "KY Official Elk Draw — Kentucky Elk & Outdoor Festival",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-09",
        deadline_type: "draw_results",
        description: "Kentucky's official elk draw held at the Kentucky Elk & Outdoor Festival at KYGUNCO, Bardstown, KY. Public event.",
        url: "https://kyoutdoorfest.com/",
        year: 2026,
      },
    ];

    for (const d of kyDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${kyStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, ${d.year}, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 2. ADD PENNSYLVANIA — Official pa.gov
  //    Opens May 1, deadline Jul 12
  //    Source: pa.gov/services/pgc/apply-for-an-elk-license
  //    Source: goerie.com (confirms Jul 13 at 11:59pm = deadline is Jul 12 submission day)
  // ============================================================
  console.log("\n── PA: Adding verified elk license dates ──");

  const paStateId = stateMap["PA"];
  if (paStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${paStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old PA deadlines`);

    const paDeadlines = [
      {
        title: "PA Elk License Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-01",
        deadline_type: "application_open",
        description: "Pennsylvania Game Commission elk license application period opens. Apply online at huntfish.pa.gov or at sports shops. PA has one of the premier eastern elk herds.",
        url: "https://www.pa.gov/services/pgc/apply-for-an-elk-license",
      },
      {
        title: "PA Elk License Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-07-12",
        deadline_type: "application_deadline",
        description: "Pennsylvania elk license application deadline at 11:59 PM. Apply at huntfish.pa.gov. Preference system rewards applicants who have applied in prior years.",
        url: "https://www.pa.gov/services/pgc/apply-for-an-elk-license",
      },
      {
        title: "PA Elk License Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-08-15",
        deadline_type: "draw_results",
        description: "Pennsylvania elk license draw results (estimated mid-August based on typical PGC timeline).",
        url: "https://www.pa.gov/agencies/pgc/huntingandtrapping/get-started-hunting/elk-hunting",
      },
    ];

    for (const d of paDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${paStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 3. FIX UTAH — Huntin' Fool / UDWR confirmed 2026 dates
  //    Opens Mar 19, deadline Apr 23, results May 31
  //    Source: huntinfool.com/states/utah
  //    Old seed had Jan 6 open / Feb 3 deadline (prior year dates)
  // ============================================================
  console.log("\n── UT: Fixing to correct 2026 dates ──");

  const utStateId = stateMap["UT"];
  if (utStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${utStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old UT deadlines`);

    const utDeadlines = [
      {
        title: "UT Big Game Draw Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-03-19",
        deadline_type: "application_open",
        description: "Utah DWR big game draw opens for all species: elk, deer, pronghorn, moose, bison, bighorn sheep, mountain goat, mountain lion, bear. Apply online or by phone at any UDWR office.",
        url: "https://wildlife.utah.gov/licenses-and-permits/hunting/big-game-drawing.html",
      },
      {
        title: "UT Big Game Draw Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-04-23",
        deadline_type: "application_deadline",
        description: "Utah DWR big game draw application deadline — elk, deer, pronghorn, moose, bison, sheep, goat, bear, cougar. All species in one application window.",
        url: "https://wildlife.utah.gov/licenses-and-permits/hunting/big-game-drawing.html",
      },
      {
        title: "UT Once-in-a-Lifetime Draw Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-04-23",
        deadline_type: "application_deadline",
        description: "Utah once-in-a-lifetime permits (moose, bison, bighorn sheep, mountain goat) — same window as big game draw.",
        url: "https://wildlife.utah.gov/licenses-and-permits/hunting/big-game-drawing.html",
      },
      {
        title: "UT Big Game Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-31",
        deadline_type: "draw_results",
        description: "Utah DWR big game draw results emailed and posted online by May 31.",
        url: "https://wildlife.utah.gov/licenses-and-permits/hunting/big-game-drawing.html",
      },
      {
        title: "UT Leftover Licenses Go On Sale",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-06-15",
        deadline_type: "application_open",
        description: "Utah leftover licenses available first-come, first-served online (estimated mid-June based on typical timeline).",
        url: "https://wildlife.utah.gov/licenses-and-permits/hunting/big-game-drawing.html",
      },
    ];

    for (const d of utDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${utStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 4. FIX IDAHO — Controlled hunt deadline is June 5, not Apr 30
  //    Source: huntinglicenseusa.com (confirmed IDFG)
  //    "Controlled hunt applications (elk, deer, pronghorn): May 1 – June 5, 2026"
  // ============================================================
  console.log("\n── ID: Fixing controlled hunt deadline ──");

  const idStateId = stateMap["ID"];
  if (idStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${idStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old ID deadlines`);

    const idDeadlines = [
      {
        title: "ID Controlled Hunt Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-01",
        deadline_type: "application_open",
        description: "Idaho Fish & Game controlled hunt application period opens for elk, deer, antelope, bighorn sheep, mountain goat, moose.",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
      {
        title: "ID Controlled Hunt Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-06-05",
        deadline_type: "application_deadline",
        description: "Idaho controlled hunt application deadline — elk, deer, pronghorn, sheep, goat, moose. Apply online at idfg.idaho.gov.",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
      {
        title: "ID Deer Controlled Hunt Deadline",
        species_id: speciesMap["mule_deer"] ?? null,
        deadline_date: "2026-06-05",
        deadline_type: "application_deadline",
        description: "Idaho deer controlled hunt application deadline (included in main controlled hunt window).",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
      {
        title: "ID Moose/Sheep/Goat Draw Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-06-05",
        deadline_type: "application_deadline",
        description: "Idaho once-in-a-lifetime species draw — moose, bighorn sheep, mountain goat. Same deadline as controlled hunts.",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
      {
        title: "ID Controlled Hunt Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-07-07",
        deadline_type: "draw_results",
        description: "Idaho controlled hunt draw results posted online (early July based on IDFG typical timeline).",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
      {
        title: "ID Spring Turkey Controlled Hunt Deadline",
        species_id: speciesMap["turkey"] ?? null,
        deadline_date: "2026-02-15",
        deadline_type: "application_deadline",
        description: "Idaho spring turkey controlled hunt application deadline.",
        url: "https://idfg.idaho.gov/hunt/controlled-hunts",
      },
    ];

    for (const d of idDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${idStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 5. FIX NM — Update draw results to Apr 22
  //    Source: huntinglicenseusa.com "Draw results expected April 22, 2026"
  // ============================================================
  console.log("\n── NM: Updating draw results date ──");

  const nmStateId = stateMap["NM"];
  if (nmStateId) {
    const updated = await sql`
      UPDATE deadlines
      SET deadline_date = '2026-04-22',
          description = 'New Mexico big game draw results available online. Expected April 22 per NMDGF timeline.'
      WHERE state_id = ${nmStateId}
        AND year = 2026
        AND deadline_type = 'draw_results'
    `;
    console.log(`  ✓ Updated ${updated.count} NM draw results to 2026-04-22`);
  }

  // ============================================================
  // 6. CONFIRM WV REMOVAL — No elk hunt exists
  //    Source: HuntWise "There are no open seasons for... elk" in WV
  //    The elk herd is too small / not huntable yet
  // ============================================================
  console.log("\n── WV: Confirming removal (no elk hunt exists) ──");

  const wvStateId = stateMap["WV"];
  if (wvStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${wvStateId} AND year = 2026`;
    console.log(`  ✗ WV: removed ${deleted.count} deadlines (no elk hunt in WV — herd not huntable)`);
  }

  // ============================================================
  // ALSO: Update Virginia with confirmed dates from dwr.virginia.gov
  // Opens Feb 1, closes Mar 31, 5 antlered elk tags
  // ============================================================
  console.log("\n── VA: Verifying/adding confirmed elk lottery dates ──");

  const vaStateId = stateMap["VA"];
  if (vaStateId) {
    const existing = await sql`SELECT COUNT(*) as cnt FROM deadlines WHERE state_id = ${vaStateId} AND year = 2026`;
    const count = Number(existing[0]?.cnt ?? 0);

    if (count === 0) {
      const vaDeadlines = [
        {
          title: "VA Elk Hunt Lottery Application Opens",
          species_id: speciesMap["elk"] ?? null,
          deadline_date: "2026-02-01",
          deadline_type: "application_open",
          description: "Virginia DWR elk hunt lottery opens. 5 antlered elk licenses available. Elk Management Zone: Buchanan, Dickenson, and Wise counties.",
          url: "https://dwr.virginia.gov/wildlife/elk/hunting/elk-lottery/",
        },
        {
          title: "VA Elk Hunt Lottery Application Deadline",
          species_id: speciesMap["elk"] ?? null,
          deadline_date: "2026-03-31",
          deadline_type: "application_deadline",
          description: "Virginia elk hunt lottery application deadline. 5 antlered elk licenses via lottery. Apply at dwr.virginia.gov.",
          url: "https://dwr.virginia.gov/wildlife/elk/hunting/elk-lottery/",
        },
        {
          title: "VA Elk Hunt Lottery Draw Results",
          species_id: speciesMap["elk"] ?? null,
          deadline_date: "2026-05-15",
          deadline_type: "draw_results",
          description: "Virginia elk hunt lottery results (estimated mid-May based on typical DWR timeline).",
          url: "https://dwr.virginia.gov/wildlife/elk/hunting/elk-lottery/",
        },
      ];

      for (const d of vaDeadlines) {
        await sql`
          INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
          VALUES (${vaStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
        `;
        console.log(`  ✓ ${d.title} (${d.deadline_date})`);
      }
    } else {
      console.log(`  · VA already has ${count} deadlines — skipping`);
    }
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log("\n=== Final Deadline Counts by State ===");
  const counts = await sql`
    SELECT s.code, COUNT(*) as cnt
    FROM deadlines d
    JOIN states s ON d.state_id = s.id
    WHERE d.year = 2026
    GROUP BY s.code
    ORDER BY s.code
  `;
  for (const r of counts) {
    console.log(`  ${r.code}: ${r.cnt}`);
  }

  const total = await sql`SELECT COUNT(*) as cnt FROM deadlines WHERE year = 2026`;
  console.log(`\nTotal 2026 deadlines: ${total[0]?.cnt ?? 0}`);

  // Also check for any 2025-dated entries (KY opens Aug 1, 2025)
  const pre2026 = await sql`SELECT COUNT(*) as cnt FROM deadlines WHERE year = 2026 AND deadline_date < '2026-01-01'`;
  console.log(`Pre-2026 dates (e.g. KY Aug 2025 open): ${pre2026[0]?.cnt ?? 0}`);

  await sql.end();
  console.log("\n✅ Done");
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  console.error(err.stack);
  process.exit(1);
});
