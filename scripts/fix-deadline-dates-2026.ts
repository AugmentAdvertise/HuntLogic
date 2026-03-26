/**
 * fix-deadline-dates-2026.ts
 *
 * Corrects verified 2026 deadlines based on official state agency sources.
 * Verified 2026-03-25 by checking each agency's website/press releases.
 *
 * States corrected: NM, ND, NH, ME, WA, MI
 * States confirmed accurate: VA (no changes needed)
 * States removed (no 2026 dates published): CA, SD, KY, VT, MN, WV, PA
 *
 * Run: DATABASE_URL=... npx tsx scripts/fix-deadline-dates-2026.ts
 */

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log("=== Fix 2026 Deadline Dates ===\n");

  // ── Get state IDs ──
  const stateRows = await sql`SELECT id, code FROM states`;
  const stateMap: Record<string, string> = {};
  for (const s of stateRows) stateMap[s.code] = s.id;

  // ── Get species IDs ──
  const speciesRows = await sql`SELECT id, slug FROM species`;
  const speciesMap: Record<string, string> = {};
  for (const s of speciesRows) speciesMap[s.slug] = s.id;

  // ============================================================
  // 1. FIX NEW MEXICO — deadline was March 18, not Feb 4
  //    Source: NMDGF official, fourcornerssci.com, ABQ Journal
  // ============================================================
  console.log("── NM: Fixing dates ──");

  // Delete old NM deadlines and re-insert correct ones
  const nmStateId = stateMap["NM"];
  if (nmStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${nmStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old NM deadlines`);

    const nmDeadlines = [
      {
        title: "NM Big Game Draw Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-03-18",
        deadline_type: "application_deadline",
        description: "New Mexico big game draw deadline at 5pm MDT — elk, deer, pronghorn, Barbary sheep, ibex, javelina, oryx. Harvest reports due by midnight same day.",
        url: "https://wildlife.dgf.nm.gov/download/2026-2027-new-mexico-hunting-rules-and-info/",
      },
      {
        title: "NM Bighorn Sheep/Oryx/Ibex Draw Deadline",
        species_id: speciesMap["bighorn_sheep"] ?? null,
        deadline_date: "2026-03-18",
        deadline_type: "application_deadline",
        description: "New Mexico once-in-a-lifetime species draw deadline — bighorn sheep, oryx, ibex, Barbary sheep (same as big game draw deadline)",
        url: "https://wildlife.dgf.nm.gov/download/2026-2027-new-mexico-hunting-rules-and-info/",
      },
      {
        title: "NM Turkey Draw Application Deadline",
        species_id: speciesMap["turkey"] ?? null,
        deadline_date: "2026-03-18",
        deadline_type: "application_deadline",
        description: "New Mexico spring turkey draw application deadline (same window as big game draw)",
        url: "https://wildlife.dgf.nm.gov/download/2026-2027-new-mexico-hunting-rules-and-info/",
      },
      {
        title: "NM Draw Results Posted",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-15",
        deadline_type: "draw_results",
        description: "New Mexico big game draw results available online (estimated mid-May based on typical timeline)",
        url: "https://wildlife.dgf.nm.gov/hunting/applications-and-draw-information/",
      },
    ];

    for (const d of nmDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${nmStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 2. FIX NORTH DAKOTA — deadline is March 25, NOT Aug/Sep
  //    Source: KFYR TV 2026-03-23, Grand Forks Herald
  //    1,062 elk licenses, 296 moose licenses
  // ============================================================
  console.log("\n── ND: Fixing dates (MAJOR — was months off) ──");

  const ndStateId = stateMap["ND"];
  if (ndStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${ndStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old ND deadlines`);

    const ndDeadlines = [
      {
        title: "ND Elk/Moose/Bighorn Lottery Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-03-04",
        deadline_type: "application_open",
        description: "North Dakota elk, moose, and bighorn sheep lottery applications open online at gf.nd.gov. 1,062 elk licenses and 296 moose licenses available for 2026.",
        url: "https://gf.nd.gov/hunting/lottery",
      },
      {
        title: "ND Elk/Moose/Bighorn Lottery Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-03-25",
        deadline_type: "application_deadline",
        description: "North Dakota elk, moose, and bighorn sheep lottery application deadline. Once-in-a-lifetime: hunters who previously received a license cannot apply for that species again.",
        url: "https://gf.nd.gov/hunting/lottery",
      },
      {
        title: "ND Moose Lottery Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-03-25",
        deadline_type: "application_deadline",
        description: "North Dakota moose lottery deadline — 296 licenses available. Must apply concurrently with elk and bighorn sheep.",
        url: "https://gf.nd.gov/hunting/lottery",
      },
      {
        title: "ND Bighorn Sheep Lottery Deadline",
        species_id: speciesMap["bighorn_sheep"] ?? null,
        deadline_date: "2026-03-25",
        deadline_type: "application_deadline",
        description: "North Dakota bighorn sheep lottery deadline. Season is tentative for 2026, contingent on summer population surveys. Applicants must apply with elk/moose but not for a specific unit.",
        url: "https://gf.nd.gov/hunting/lottery",
      },
      {
        title: "ND Elk/Moose/Bighorn Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-04-15",
        deadline_type: "draw_results",
        description: "North Dakota elk, moose, and bighorn sheep lottery results (estimated mid-April)",
        url: "https://gf.nd.gov/hunting/lottery",
      },
    ];

    for (const d of ndDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${ndStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 3. FIX NEW HAMPSHIRE — deadline is May 29, not April 15
  //    Source: NH Fish & Game official release 2026-03-18
  //    Hunt runs Oct 17-25, 2026
  // ============================================================
  console.log("\n── NH: Fixing moose lottery deadline ──");

  const nhStateId = stateMap["NH"];
  if (nhStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${nhStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old NH deadlines`);

    const nhDeadlines = [
      {
        title: "NH Moose Hunt Lottery Opens",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-03-18",
        deadline_type: "application_open",
        description: "New Hampshire 2026 moose hunt lottery applications now available online at wildlife.nh.gov or from license agents. NH has held an annual moose hunt since 1988.",
        url: "https://www.wildlife.state.nh.us/hunting/moose-hunting.html",
      },
      {
        title: "NH Moose Hunt Lottery Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-05-29",
        deadline_type: "application_deadline",
        description: "New Hampshire moose hunt lottery application deadline — must be postmarked or submitted online by midnight EST on Friday, May 29.",
        url: "https://www.wildlife.state.nh.us/hunting/moose-hunting.html",
      },
      {
        title: "NH Moose Hunt Lottery Drawing",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-06-15",
        deadline_type: "draw_results",
        description: "New Hampshire moose hunt lottery drawing (estimated mid-June). Hunt runs October 17-25, 2026.",
        url: "https://www.wildlife.state.nh.us/hunting/moose-hunting.html",
      },
    ];

    for (const d of nhDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${nhStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 4. FIX MAINE — drawing is June 20, not June 30
  //    Source: Bangor Daily News 2026-03-05
  // ============================================================
  console.log("\n── ME: Fixing moose lottery drawing date ──");

  const meStateId = stateMap["ME"];
  if (meStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${meStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old ME deadlines`);

    const meDeadlines = [
      {
        title: "ME Moose Permit Lottery Application Opens",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-03-01",
        deadline_type: "application_open",
        description: "Maine moose permit lottery applications available. Maine issues ~3,000+ permits annually — one of the largest moose hunts in the eastern US.",
        url: "https://www.maine.gov/ifw/hunting-trapping/hunting/moose/index.html",
      },
      {
        title: "ME Moose Permit Lottery Application Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-05-15",
        deadline_type: "application_deadline",
        description: "Maine moose permit lottery application deadline. Apply online at maine.gov/ifw. Bonus point system — each unsuccessful application adds one chance.",
        url: "https://www.maine.gov/ifw/hunting-trapping/hunting/moose/index.html",
      },
      {
        title: "ME Moose Permit Lottery Drawing",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-06-20",
        deadline_type: "draw_results",
        description: "Maine moose permit lottery drawing held at Acton Fairgrounds in Acton, ME. Public event.",
        url: "https://www.maine.gov/ifw/hunting-trapping/hunting/moose/index.html",
      },
    ];

    for (const d of meDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${meStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 5. FIX WASHINGTON — multi-season deadline Mar 31,
  //    special hunt permits ~Apr-May (historically May 22-26)
  //    Source: mywdfw.org, wdfw.wa.gov
  // ============================================================
  console.log("\n── WA: Fixing dates ──");

  const waStateId = stateMap["WA"];
  if (waStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${waStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old WA deadlines`);

    const waDeadlines = [
      {
        title: "WA Multi-Season Tag Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-03-31",
        deadline_type: "application_deadline",
        description: "Washington WDFW multi-season tag purchase deadline for deer and elk. Purchase at license vendor, online at fishhunt.dfw.wa.gov, or by phone.",
        url: "https://www.mywdfw.org/multi-season-special-hunt/",
      },
      {
        title: "WA Special Hunt Permit Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-04-22",
        deadline_type: "application_open",
        description: "Washington WDFW special hunt permit application period opens for fall deer, elk, moose, bighorn sheep, mountain goat, turkey.",
        url: "https://wdfw.wa.gov/hunting/permits",
      },
      {
        title: "WA Special Hunt Permit Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-22",
        deadline_type: "application_deadline",
        description: "Washington special hunt permit application deadline — elk, deer, moose, bighorn sheep, mountain goat, turkey. Based on typical WDFW timeline (historically mid-late May).",
        url: "https://wdfw.wa.gov/hunting/permits",
      },
      {
        title: "WA Moose/Sheep/Goat Draw Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-05-22",
        deadline_type: "application_deadline",
        description: "Washington once-in-a-lifetime species draw — moose, bighorn sheep, mountain goat (same window as special hunt permits)",
        url: "https://wdfw.wa.gov/hunting/permits",
      },
      {
        title: "WA Special Hunt Permit Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-06-30",
        deadline_type: "draw_results",
        description: "Washington special hunt permit draw results. Successful applicants must pay by July 31 or permit is void.",
        url: "https://wdfw.wa.gov/hunting/permits",
      },
    ];

    for (const d of waDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${waStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 6. FIX MICHIGAN — elk/bear May 1 – Jun 1, results Jun 24
  //    Moose lottery is separate (typically same window)
  //    Source: michigan.gov/dnr, Lansing State Journal
  // ============================================================
  console.log("\n── MI: Fixing elk/moose dates ──");

  const miStateId = stateMap["MI"];
  if (miStateId) {
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${miStateId} AND year = 2026`;
    console.log(`  Deleted ${deleted.count} old MI deadlines`);

    const miDeadlines = [
      {
        title: "MI Elk/Bear/Moose License Application Opens",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-05-01",
        deadline_type: "application_open",
        description: "Michigan DNR elk, bear, and moose license lottery application window opens. Upper Peninsula moose hunt — Michigan issues roughly 100 moose licenses per year.",
        url: "https://www.michigan.gov/dnr/things-to-do/hunting/elk/elk-application-information",
      },
      {
        title: "MI Elk/Bear/Moose License Application Deadline",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-06-01",
        deadline_type: "application_deadline",
        description: "Michigan elk, bear, and moose license lottery application deadline. Apply at Michigan.gov/DNRLicenses.",
        url: "https://www.michigan.gov/dnr/things-to-do/hunting/elk/elk-application-information",
      },
      {
        title: "MI Moose License Application Deadline",
        species_id: speciesMap["moose"] ?? null,
        deadline_date: "2026-06-01",
        deadline_type: "application_deadline",
        description: "Michigan moose license lottery deadline — Upper Peninsula zones only. Apply at Michigan.gov/DNRLicenses.",
        url: "https://www.michigan.gov/dnr/managing-resources/wildlife/moose",
      },
      {
        title: "MI Elk/Bear/Moose Draw Results",
        species_id: speciesMap["elk"] ?? null,
        deadline_date: "2026-06-24",
        deadline_type: "draw_results",
        description: "Michigan elk, bear, and moose license lottery results posted online at Michigan.gov/DNRLicenses.",
        url: "https://www.michigan.gov/dnr/things-to-do/hunting/elk/elk-application-information",
      },
    ];

    for (const d of miDeadlines) {
      await sql`
        INSERT INTO deadlines (state_id, species_id, title, deadline_date, deadline_type, description, year, url, created_at)
        VALUES (${miStateId}, ${d.species_id}, ${d.title}, ${d.deadline_date}, ${d.deadline_type}, ${d.description}, 2026, ${d.url}, NOW())
      `;
      console.log(`  ✓ ${d.title} (${d.deadline_date})`);
    }
  }

  // ============================================================
  // 7. REMOVE states with NO confirmed 2026 dates
  //    CA, SD, KY, VT, MN, WV, PA
  //    These had estimated dates that could mislead users
  // ============================================================
  console.log("\n── Removing unverified states ──");

  const removeCodes = ["CA", "SD", "KY", "VT", "MN", "WV", "PA"];
  for (const code of removeCodes) {
    const stateId = stateMap[code];
    if (!stateId) {
      console.log(`  [SKIP] ${code} not in DB`);
      continue;
    }
    const deleted = await sql`DELETE FROM deadlines WHERE state_id = ${stateId} AND year = 2026`;
    console.log(`  ✗ ${code}: removed ${deleted.count} unverified deadlines`);
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

  await sql.end();
  console.log("\n✅ Done");
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  console.error(err.stack);
  process.exit(1);
});
