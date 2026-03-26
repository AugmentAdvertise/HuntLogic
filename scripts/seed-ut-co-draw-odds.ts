/**
 * Seed Utah DWR and update CPW draw odds source configs
 * 
 * Utah: public PDFs at wildlife.utah.gov/pdf/bg/2025/ - no login needed
 * CPW: draw recap PDFs hosted on cpw.widen.net CDN, linked from species stats pages
 */

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL || "");

async function main() {
  console.log("=== Seeding UT + CO draw odds sources ===\n");

  // ── Utah DWR ──────────────────────────────────────────────────────────────
  // wildlife.utah.gov hosts all draw odds PDFs publicly at /pdf/bg/{year}/
  // Key 2025 files confirmed 200 OK:
  //   /pdf/bg/2025/25_bg-odds.pdf         — master big game odds
  //   /pdf/bg/2025/25_deer_odds.pdf       — deer-specific
  //   /pdf/bg/2025/25_antlerless_drawing_odds_report.pdf
  //   /pdf/bears/25_drawing_odds.pdf      — bear draw odds
  // Page that links them: wildlife.utah.gov/bg-odds.html

  const [utState] = await sql`SELECT id FROM states WHERE code = 'UT' LIMIT 1`;
  if (!utState) throw new Error("UT state not found in DB");

  const utDrawConfig = {
    adapter: "pdf_download",
    base_url: "https://wildlife.utah.gov",
    state_code: "UT",
    timeout_ms: 60000,
    species_slugs: ["elk", "mule_deer", "pronghorn", "moose", "bighorn_sheep", "mountain_goat", "black_bear", "turkey", "bison"],
    rate_limit: { requests_per_minute: 5 },
    retry: { max_attempts: 3, backoff_ms: 10000 },
    endpoints: [
      {
        path: "/pdf/bg/2025/25_bg-odds.pdf",
        is_absolute_url: false,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
        schedule: "0 6 1 7 *", // annual after July draw results
      },
      {
        path: "/pdf/bg/2025/25_deer_odds.pdf",
        is_absolute_url: false,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
        species_filter: "mule_deer",
      },
      {
        path: "/pdf/bg/2025/25_antlerless_drawing_odds_report.pdf",
        is_absolute_url: false,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
      },
      {
        path: "/pdf/bears/25_drawing_odds.pdf",
        is_absolute_url: false,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
        species_filter: "black_bear",
      },
      // 2024 for historical comparison
      {
        path: "/pdf/bg/2024/24_bg-odds.pdf",
        is_absolute_url: false,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2024,
      },
    ],
  };

  // Insert Utah draw odds source
  const [existingUt] = await sql`
    SELECT id FROM data_sources WHERE name = 'Utah DWR Draw Odds' LIMIT 1
  `;

  if (existingUt) {
    await sql`
      UPDATE data_sources
      SET url = 'https://wildlife.utah.gov/bg-odds.html',
          scraper_config = ${sql.json(utDrawConfig)},
          status = 'active',
          enabled = true,
          updated_at = NOW()
      WHERE id = ${existingUt.id}
    `;
    console.log("✅ Updated existing Utah DWR Draw Odds source:", existingUt.id);
  } else {
    const [inserted] = await sql`
      INSERT INTO data_sources (name, source_type, authority_tier, url, scraper_config, refresh_cadence, status, enabled)
      VALUES (
        'Utah DWR Draw Odds',
        'draw_report',
        1,
        'https://wildlife.utah.gov/bg-odds.html',
        ${sql.json(utDrawConfig)},
        'annual',
        'active',
        true
      )
      RETURNING id
    `;
    console.log("✅ Inserted Utah DWR Draw Odds source:", inserted.id);
  }

  // ── Colorado CPW ──────────────────────────────────────────────────────────
  // CPW no longer has a stats page at the old URL (.aspx pages are gone).
  // Draw recap reports now live on cpw.widen.net CDN.
  // The 2025 elk draw recap is confirmed 200 OK:
  //   https://cpw.widen.net/s/qh6nqttnnz/postdrawrecapreport_elk-25_05172025_0612
  //   https://cpw.widen.net/s/xvrbwnvmj7/postdrawnoutreport_elk-25_05172025_0631
  // 2024 elk:
  //   https://cpw.widen.net/s/gvtppdkdcr/2024-primary-elk-post-draw-report
  //   https://cpw.widen.net/s/mnmvsqzvkz/drawn-out-at-report-2024-primary-elk
  // These PDFs contain per-unit draw odds data.

  const cpwDrawConfig = {
    adapter: "pdf_download",
    base_url: "https://cpw.widen.net",
    state_code: "CO",
    timeout_ms: 60000,
    species_slugs: ["elk", "mule_deer", "pronghorn", "moose", "bighorn_sheep", "mountain_goat", "black_bear"],
    rate_limit: { requests_per_minute: 5 },
    retry: { max_attempts: 3, backoff_ms: 10000 },
    endpoints: [
      // 2025 Elk
      {
        path: "https://cpw.widen.net/s/qh6nqttnnz/postdrawrecapreport_elk-25_05172025_0612",
        is_absolute_url: true,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
        species_filter: "elk",
        label: "2025 Elk Primary Draw Recap",
      },
      {
        path: "https://cpw.widen.net/s/xvrbwnvmj7/postdrawnoutreport_elk-25_05172025_0631",
        is_absolute_url: true,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2025,
        species_filter: "elk",
        label: "2025 Elk Drawn-Out Report",
      },
      // 2024 Elk (for historical data)
      {
        path: "https://cpw.widen.net/s/gvtppdkdcr/2024-primary-elk-post-draw-report",
        is_absolute_url: true,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2024,
        species_filter: "elk",
        label: "2024 Elk Primary Draw Report",
      },
      {
        path: "https://cpw.widen.net/s/mnmvsqzvkz/drawn-out-at-report-2024-primary-elk",
        is_absolute_url: true,
        parser: "draw_odds_table",
        doc_type: "draw_report",
        year: 2024,
        species_filter: "elk",
        label: "2024 Elk Drawn-Out Report",
      },
    ],
    // Note: Deer, pronghorn, bear, moose stats also available via species-specific
    // pages at /activities/hunting/big-game/hunting-{species}/{species}-statistics
    // but widen.net slugs need to be extracted per-species. Elk is done first
    // since it's highest priority. Add other species in subsequent passes.
    notes: "CPW migrated from .aspx pages to widen.net CDN for PDF hosting. Per-species stat pages: /activities/hunting/big-game/hunting-{species}/{species}-statistics",
  };

  // Update the active CPW draw results source (prefer the one with last_fetched)
  const cpwUpdated = await sql`
    UPDATE data_sources
    SET url = 'https://cpw.state.co.us/activities/hunting/big-game/hunting-elk/elk-statistics',
        scraper_config = ${sql.json(cpwDrawConfig)},
        status = 'active',
        enabled = true,
        updated_at = NOW()
    WHERE id = 'cd08bbec-4172-49be-be43-9cc725309714'
    RETURNING id, name
  `;
  console.log("✅ Updated CPW Draw Results source:", cpwUpdated[0]?.id);

  // Disable the dead .aspx CPW source so it doesn't waste cycles
  const cpwDisabled = await sql`
    UPDATE data_sources
    SET status = 'paused',
        enabled = false,
        last_error = 'Old .aspx URL — CPW site redesigned. Replaced by widen.net PDF endpoints.',
        updated_at = NOW()
    WHERE id = '8fceb9be-fa9c-45e4-aaa3-0fb9a1468f54'
    RETURNING id, name
  `;
  console.log("⏸️  Paused dead CPW .aspx source:", cpwDisabled[0]?.id);

  console.log("\n=== Done ===");
  console.log("Next: trigger ingestion for UT and CO sources");
  console.log("  npx tsx scripts/direct-ingest.ts --state UT");
  console.log("  npx tsx scripts/direct-ingest.ts --state CO");

  await sql.end();
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
