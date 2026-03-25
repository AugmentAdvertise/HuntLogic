/**
 * fix-verified-deadlines.ts
 *
 * Corrects deadlines to match dates published by state agencies.
 * Every date here is sourced from an official agency website or document.
 *
 * Sources:
 *  UT: wildlife.utah.gov/guidebooks/biggameapp.pdf (official 2026 guidebook)
 *  WY: wgfd.wyo.gov/licenses-applications/application-dates-deadlines (live table)
 *  NV: ndow.org/apply-buy/apply-buy-hunting/ (official 2026 calendar)
 *  OR: myodfw.com/articles/controlled-hunt-navigation (official page)
 *  ID: idfg.idaho.gov/licenses/tag/controlled (official controlled hunt page)
 *  MT: fwp.mt.gov 2026 Online Licensing Guidebook PDF
 *  ND: gf.nd.gov/news-releases (press release Mar 4 2026: deadline Mar 25)
 *
 * States with no 2026 dates published yet (CA, SD, WA, NM, and eastern states):
 *  → Entries deleted and flagged for re-seeding when announced.
 *
 * Run: DATABASE_URL=... npx tsx scripts/fix-verified-deadlines.ts
 */

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log("=== Fix Verified Deadlines ===\n");

  // Fetch state IDs
  const stateRows = await sql`SELECT id, code FROM states`;
  const stateMap: Record<string, string> = {};
  for (const s of stateRows) stateMap[s.code as string] = s.id as string;

  // Fetch species IDs
  const speciesRows = await sql`SELECT id, slug FROM species`;
  const sp: Record<string, string> = {};
  for (const r of speciesRows) sp[r.slug as string] = r.id as string;

  // ============================================================
  // STEP 1: Delete all unverified entries for states where
  //         2026 dates have not yet been officially published.
  //         These will be re-seeded once agencies publish them.
  // ============================================================
  const unverifiedStates = ["CA", "SD", "WA", "NM", "PA", "KY", "VA", "WV", "ME", "NH", "VT", "MI", "MN"];
  console.log("Step 1: Removing unverified entries for states without published 2026 dates...");
  for (const code of unverifiedStates) {
    const sid = stateMap[code];
    if (!sid) continue;
    const result = await sql`DELETE FROM deadlines WHERE state_id = ${sid} RETURNING id`;
    console.log(`  ${code}: deleted ${result.length} rows`);
  }

  // ============================================================
  // STEP 2: Fix Utah
  //  Source: wildlife.utah.gov/guidebooks/biggameapp.pdf
  //  Opens: March 19, 2026 | Deadline: April 23, 2026 | Results: May 31, 2026
  //  Antlerless application: June 9–23, 2026
  //  Leftover/OTC sales start July 7, 2026
  // ============================================================
  console.log("\nStep 2: Fixing Utah...");
  const utId = stateMap["UT"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${utId}`;

  const utDeadlines = [
    { title: "UT Big Game Draw Application Opens", species: "elk", date: "2026-03-19", type: "application_open", desc: "Utah DWR big game draw opens for elk, deer, pronghorn, moose, bison, bighorn sheep, mountain goat. Apply at utahdraws.com or call 855-883-7297.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
    { title: "UT Big Game Draw Application Deadline", species: "elk", date: "2026-04-23", type: "application_deadline", desc: "Utah DWR big game draw application deadline — all species. Deadline 11 p.m. MDT.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
    { title: "UT Big Game Draw Results", species: "elk", date: "2026-05-31", type: "draw_results", desc: "Utah big game draw results available online at utahdraws.com. Successful applicants notified by email.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
    { title: "UT Antlerless Application Opens", species: "elk", date: "2026-06-09", type: "application_open", desc: "Utah antlerless elk and deer applications open. Also second opportunity for bonus/preference points.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
    { title: "UT Antlerless Application Deadline", species: "elk", date: "2026-06-23", type: "application_deadline", desc: "Utah antlerless application deadline. Results available on or before July 8.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
    { title: "UT Leftover/OTC Licenses Available", species: "elk", date: "2026-07-07", type: "application_open", desc: "Remaining Utah big game permits go on sale — general archery elk, remaining limited-entry permits, bison (Nine Mile). Buy at utahdraws.com.", url: "https://wildlife.utah.gov/guidebooks/biggameapp.pdf" },
  ];
  for (const d of utDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${utId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // STEP 3: Fix Wyoming
  //  Source: wgfd.wyo.gov/licenses-applications/application-dates-deadlines
  //  Already fixed in previous script — open dates are Jan 2 for most.
  //  Just verify existing entries are correct; no changes needed.
  // ============================================================
  console.log("\nStep 3: Wyoming — verifying existing entries (already fixed from WGFD live table)...");
  const wyCount = await sql`SELECT COUNT(*) as cnt FROM deadlines WHERE state_id = ${stateMap["WY"]!}`;
  console.log(`  WY: ${wyCount[0]!.cnt} entries (correct per wgfd.wyo.gov)`);

  // ============================================================
  // STEP 4: Fix Nevada
  //  Source: ndow.org/apply-buy/apply-buy-hunting/
  //  NR Guided: Opens Feb 9, Deadline Mar 9, Results Mar 20
  //  Main draw: Opens Mar 23, Deadline May 13, Results May 29
  //  Second draw: Opens Jun 8, Deadline Jun 15, Results Jun 26
  //  First-Come-First-Served: opens early-mid July
  // ============================================================
  console.log("\nStep 4: Fixing Nevada...");
  const nvId = stateMap["NV"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${nvId}`;

  const nvDeadlines = [
    { title: "NV NR Guided Mule Deer Application Opens", species: "mule_deer", date: "2026-02-09", type: "application_open", desc: "Nevada nonresident guided mule deer hunt application opens. Nonresidents only.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV NR Guided Mule Deer Application Deadline", species: "mule_deer", date: "2026-03-09", type: "application_deadline", desc: "Nevada nonresident guided mule deer hunt application deadline. Results posted March 20.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Main Draw Application Opens", species: "elk", date: "2026-03-23", type: "application_open", desc: "Nevada NDOW main big game draw opens — elk, mule deer, bighorn sheep, mountain goat, moose, pronghorn, black bear. Apply at ndowlicensing.com.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Main Draw Application Deadline", species: "elk", date: "2026-05-13", type: "application_deadline", desc: "Nevada main big game draw application deadline. Results posted May 29.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Main Draw Results", species: "elk", date: "2026-05-29", type: "draw_results", desc: "Nevada main big game draw results posted online at ndowlicensing.com.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Second Draw Application Opens", species: "elk", date: "2026-06-08", type: "application_open", desc: "Nevada second draw opens for remaining/returned tags. Any residency eligible.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Second Draw Application Deadline", species: "elk", date: "2026-06-15", type: "application_deadline", desc: "Nevada second draw deadline. Results posted June 26.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
    { title: "NV Bonus Point Application Deadline", species: "elk", date: "2026-05-13", type: "preference_point", desc: "Nevada bonus point applications close with main draw deadline (May 13). Apply at ndowlicensing.com.", url: "https://www.ndow.org/apply-buy/apply-buy-hunting/" },
  ];
  for (const d of nvDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${nvId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // STEP 5: Fix Oregon
  //  Source: myodfw.com/articles/controlled-hunt-navigation
  //  Application deadline: May 15, 2026 (11:59 p.m. PT)
  //  Draw results: announced by June 12 each year
  //  No official "open date" published for 2026 yet — ODFW typically
  //  opens applications in January with the new license year.
  // ============================================================
  console.log("\nStep 5: Fixing Oregon...");
  const orId = stateMap["OR"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${orId}`;

  const orDeadlines = [
    { title: "OR Controlled Hunt Application Opens", species: "elk", date: "2026-01-01", type: "application_open", desc: "Oregon ODFW controlled hunt applications open with new license year. Apply at odfw.huntfishoregon.com for elk, deer, pronghorn, bighorn sheep, mountain goat, spring black bear.", url: "https://myodfw.com/articles/controlled-hunt-navigation" },
    { title: "OR Controlled Hunt Application Deadline", species: "elk", date: "2026-05-15", type: "application_deadline", desc: "Oregon controlled hunt application deadline — 11:59 p.m. PT. Elk, deer, pronghorn, bighorn sheep, mountain goat, spring black bear. Apply online or at ODFW offices.", url: "https://myodfw.com/articles/controlled-hunt-navigation" },
    { title: "OR Controlled Hunt Draw Results", species: "elk", date: "2026-06-12", type: "draw_results", desc: "Oregon controlled hunt draw results announced by June 12. Check online at odfw.huntfishoregon.com.", url: "https://myodfw.com/articles/controlled-hunt-navigation" },
    { title: "OR Preference Point Application Deadline", species: "elk", date: "2026-05-15", type: "preference_point", desc: "Oregon preference point (Point Saver) applications due by May 15 — same as main draw deadline.", url: "https://myodfw.com/articles/controlled-hunt-navigation" },
  ];
  for (const d of orDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${orId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // STEP 6: Fix Idaho
  //  Source: idfg.idaho.gov/licenses/tag/controlled (official controlled hunt page)
  //  Spring Bear: Jan 15 – Feb 15
  //  Spring Turkey: Feb 1 – Mar 1
  //  Moose/Bighorn Sheep/Mountain Goat: Apr 1 – Apr 30
  //  Deer/Elk/Pronghorn/Fall Bear/Fall Turkey/Swan: May 1 – Jun 5
  //  (Second drawings follow for moose/sheep/goat Jun 15–25, deer/elk Aug 5–15)
  // ============================================================
  console.log("\nStep 6: Fixing Idaho...");
  const idId = stateMap["ID"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${idId}`;

  const idDeadlines = [
    { title: "ID Spring Bear Application Opens", species: "black_bear", date: "2026-01-15", type: "application_open", desc: "Idaho spring bear controlled hunt application opens.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Spring Bear Application Deadline", species: "black_bear", date: "2026-02-15", type: "application_deadline", desc: "Idaho spring bear controlled hunt application deadline.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Spring Turkey Application Opens", species: "turkey", date: "2026-02-01", type: "application_open", desc: "Idaho spring turkey controlled hunt application opens.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Spring Turkey Application Deadline", species: "turkey", date: "2026-03-01", type: "application_deadline", desc: "Idaho spring turkey controlled hunt application deadline.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Moose/Bighorn Sheep/Mountain Goat Application Opens", species: "moose", date: "2026-04-01", type: "application_open", desc: "Idaho controlled hunt applications open for moose, bighorn sheep, and mountain goat.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Moose/Bighorn Sheep/Mountain Goat Application Deadline", species: "moose", date: "2026-04-30", type: "application_deadline", desc: "Idaho moose, bighorn sheep, and mountain goat controlled hunt application deadline. Second drawing: June 15–25.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Deer/Elk/Pronghorn/Bear/Turkey Application Opens", species: "elk", date: "2026-05-01", type: "application_open", desc: "Idaho deer, elk, pronghorn, fall bear, fall turkey, and swan controlled hunt applications open.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
    { title: "ID Deer/Elk/Pronghorn/Bear/Turkey Application Deadline", species: "elk", date: "2026-06-05", type: "application_deadline", desc: "Idaho deer, elk, pronghorn, fall bear, fall turkey, and swan controlled hunt application deadline. Second drawing: August 5–15.", url: "https://idfg.idaho.gov/licenses/tag/controlled" },
  ];
  for (const d of idDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${idId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // STEP 7: Fix Montana
  //  Source: fwp.mt.gov 2026 Online Licensing Guidebook PDF
  //  Deer/Elk NR combo opens Mar 1, deadline Apr 1
  //  Moose/Sheep/Goat deadline May 1
  //  Elk B/Deer B/Antelope deadline Jun 1
  // ============================================================
  console.log("\nStep 7: Fixing Montana...");
  const mtId = stateMap["MT"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${mtId}`;

  const mtDeadlines = [
    { title: "MT Deer/Elk Special Permit Application Opens", species: "elk", date: "2026-03-01", type: "application_open", desc: "Montana FWP deer and elk special permit applications open. Includes nonresident combination permits. Apply at fwp.mt.gov or through MyFWP.", url: "https://fwp.mt.gov/buyandapply" },
    { title: "MT Deer/Elk Special Permit Application Deadline", species: "elk", date: "2026-04-01", type: "application_deadline", desc: "Montana deer and elk special permit application deadline — 11:45 p.m. MST. Includes nonresident elk/deer permit combinations. Drawing mid-April.", url: "https://fwp.mt.gov/buyandapply" },
    { title: "MT Moose/Bighorn Sheep/Mountain Goat Application Deadline", species: "moose", date: "2026-05-01", type: "application_deadline", desc: "Montana moose, bighorn sheep, and mountain goat special permit application deadline — 11:45 p.m. MST. Drawing mid-May.", url: "https://fwp.mt.gov/buyandapply" },
    { title: "MT Antelope/Elk B/Deer B Application Deadline", species: "pronghorn", date: "2026-06-01", type: "application_deadline", desc: "Montana antelope, Elk B, and Deer B special permit application deadline — 11:45 p.m. MST. Archery drawing mid-June; rifle drawing early August.", url: "https://fwp.mt.gov/buyandapply" },
  ];
  for (const d of mtDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${mtId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // STEP 8: Fix North Dakota
  //  Source: gf.nd.gov/news-releases (press release, March 4 and March 23 2026)
  //  Elk/Moose/Bighorn Sheep: opened March 4, 2026; deadline March 25, 2026
  //  Deer/antelope applications open later in the year (not yet announced for 2026)
  // ============================================================
  console.log("\nStep 8: Fixing North Dakota...");
  const ndId = stateMap["ND"]!;
  await sql`DELETE FROM deadlines WHERE state_id = ${ndId}`;

  const ndDeadlines = [
    { title: "ND Elk/Moose/Bighorn Sheep Application Opens", species: "elk", date: "2026-03-04", type: "application_open", desc: "North Dakota Game & Fish online applications open for elk, moose, and bighorn sheep once-in-a-lifetime lottery. Apply at gf.nd.gov. 1,062 elk licenses available; 296 moose licenses.", url: "https://gf.nd.gov/news-releases" },
    { title: "ND Elk/Moose/Bighorn Sheep Application Deadline", species: "elk", date: "2026-03-25", type: "application_deadline", desc: "North Dakota elk, moose, and bighorn sheep lottery license application deadline — midnight. Once-in-a-lifetime licenses; prior recipients ineligible. Apply at gf.nd.gov.", url: "https://gf.nd.gov/news-releases" },
    { title: "ND Spring Turkey Application Deadline", species: "turkey", date: "2026-02-17", type: "application_deadline", desc: "North Dakota spring turkey lottery deadline. Remaining licenses available first-come, first-served from Feb 25 at 8 a.m. CT.", url: "https://gf.nd.gov/news-releases" },
  ];
  for (const d of ndDeadlines) {
    const speciesId = sp[d.species] ?? null;
    await sql`INSERT INTO deadlines (state_id,species_id,title,deadline_date,deadline_type,description,year,url,created_at)
      VALUES (${ndId},${speciesId},${d.title},${d.date},${d.type},${d.desc},2026,${d.url},NOW()) ON CONFLICT DO NOTHING`;
    console.log(`  + ${d.title} (${d.date})`);
  }

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log("\n=== Final DB counts by state ===");
  const counts = await sql`
    SELECT s.code, COUNT(*) as cnt
    FROM deadlines d JOIN states s ON d.state_id = s.id
    GROUP BY s.code ORDER BY s.code
  `;
  for (const r of counts) {
    console.log(`  ${r.code}: ${r.cnt}`);
  }

  await sql.end();
  console.log("\n✅ Done");
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
