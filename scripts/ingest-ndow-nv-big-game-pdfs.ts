import postgres from "postgres";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import * as crypto from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USER_AGENT = "Mozilla/5.0 HuntLogic/1.0";
const BONUS_PAGE_URL = "https://www.ndow.org/blog/bonus-point-data/";
const HARVEST_INDEX_URL = "https://www.ndow.org/wp-content/uploads/2026/03/";
const SOURCE_NAME = "NDOW Nevada Big Game PDF Reports";
const SOURCE_URL = "https://www.ndow.org/";
const TARGET_YEAR = 2025;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = postgres(DATABASE_URL, { ssl: "require" });
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

type ReportKind = "bonus_point" | "harvest_report";

type SourceDoc = {
  url: string;
  title: string;
  reportKind: ReportKind;
  speciesSlug: string | null;
  metadata: Record<string, unknown>;
};

const SPECIES_PATTERNS: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /mule-deer/i, slug: "mule_deer" },
  { pattern: /elk/i, slug: "elk" },
  { pattern: /antelope/i, slug: "pronghorn" },
  { pattern: /bear/i, slug: "black_bear" },
  { pattern: /desert-bighorn|california-bighorn|rocky(?:-mountain)?-bighorn/i, slug: "bighorn_sheep" },
  { pattern: /moose/i, slug: "moose" },
  { pattern: /mountain-goat/i, slug: "mountain_goat" },
];

function normalizeWhitespace(text: string): string {
  return text.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueByUrl<T extends { url: string }>(docs: T[]): T[] {
  const seen = new Set<string>();
  return docs.filter((doc) => {
    if (seen.has(doc.url)) return false;
    seen.add(doc.url);
    return true;
  });
}

function inferSpeciesSlug(value: string): string | null {
  for (const entry of SPECIES_PATTERNS) {
    if (entry.pattern.test(value)) return entry.slug;
  }
  return null;
}

function toTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return await res.text();
}

async function fetchBonusDocs(): Promise<SourceDoc[]> {
  const html = await fetchText(BONUS_PAGE_URL);
  const hrefs = Array.from(html.matchAll(/href=["']([^"']+\.pdf)["']/gi), (match) => match[1]);

  return uniqueByUrl(
    hrefs
      .filter((href) => /2026\/01\//.test(href) || /2026\/03\//.test(href))
      .map((href) => {
        const filename = href.split("/").pop() ?? href;
        const speciesSlug = inferSpeciesSlug(filename);
        const residency = /nonresident/i.test(filename)
          ? "nonresident"
          : /resident/i.test(filename)
            ? "resident"
            : null;
        const weapon = /archery/i.test(filename)
          ? "archery"
          : /muzzleloader/i.test(filename)
            ? "muzzleloader"
            : /alw/i.test(filename)
              ? "any legal weapon"
              : null;

        return {
          url: href,
          title: toTitleFromFilename(filename),
          reportKind: "bonus_point" as const,
          speciesSlug,
          metadata: {
            reportKind: "bonus_point",
            sourcePage: BONUS_PAGE_URL,
            filename,
            residency,
            weapon,
            year: TARGET_YEAR,
          },
        };
      }),
  );
}

async function fetchHarvestDocs(): Promise<SourceDoc[]> {
  const html = await fetchText(HARVEST_INDEX_URL);
  const hrefs = Array.from(html.matchAll(/href=["']([^"']+\.pdf)["']/gi), (match) => match[1]);

  return uniqueByUrl(
    hrefs
      .filter((href) => /2025-.*Harvest-by-Unit-Group/i.test(href))
      .map((href) => {
        const absoluteUrl = href.startsWith("http")
          ? href
          : `${HARVEST_INDEX_URL}${href.replace(/^\//, "")}`;
        const filename = absoluteUrl.split("/").pop() ?? absoluteUrl;
        const speciesSlug = inferSpeciesSlug(filename);

        return {
          url: absoluteUrl,
          title: toTitleFromFilename(filename),
          reportKind: "harvest_report" as const,
          speciesSlug,
          metadata: {
            reportKind: "harvest_report",
            sourcePage: HARVEST_INDEX_URL,
            filename,
            year: TARGET_YEAR,
          },
        };
      }),
  );
}

async function embedText(text: string): Promise<number[] | null> {
  if (!ai) return null;

  const truncated = text.slice(0, 32000);
  if (truncated.length < 50) return null;

  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: truncated,
    config: { outputDimensionality: 768 },
  });

  return result.embeddings?.[0]?.values ?? null;
}

async function ensureSourceId(): Promise<string> {
  const existing = await sql`
    SELECT id FROM data_sources WHERE name = ${SOURCE_NAME} LIMIT 1
  `;

  if (existing[0]?.id) return existing[0].id;

  const inserted = await sql`
    INSERT INTO data_sources (
      name, source_type, authority_tier, url, scraper_config, refresh_cadence,
      status, enabled, created_at, updated_at
    ) VALUES (
      ${SOURCE_NAME}, ${"state_agency"}, ${1}, ${SOURCE_URL}, ${JSON.stringify({
        adapter: "pdf_download",
        note: "NDOW Nevada big game bonus point and harvest PDFs",
      })}::jsonb, ${"annual"}, ${"active"}, ${true}, NOW(), NOW()
    )
    RETURNING id
  `;

  return inserted[0].id;
}

async function getStateAndSpeciesIds() {
  const stateRows = await sql`SELECT id FROM states WHERE code = 'NV' LIMIT 1`;
  const speciesRows = await sql`SELECT id, slug FROM species`;

  const stateId = stateRows[0]?.id;
  if (!stateId) throw new Error("NV state row not found");

  const speciesIdBySlug = new Map<string, string>();
  for (const row of speciesRows) {
    speciesIdBySlug.set(row.slug, row.id);
  }

  return { stateId, speciesIdBySlug };
}

async function extractPdfText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/pdf,*/*;q=0.8" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const pdf = new PDFParse({ data: Buffer.from(arrayBuffer) });
  const textResult = await pdf.getText();
  return normalizeWhitespace(textResult.text);
}

async function upsertDocument(
  sourceId: string,
  stateId: string,
  speciesIdBySlug: Map<string, string>,
  doc: SourceDoc,
) {
  const content = await extractPdfText(doc.url);
  if (content.length < 100) {
    throw new Error(`Parsed content too short for ${doc.url}`);
  }

  const contentHash = crypto.createHash("sha256").update(content).digest("hex");
  const speciesId = doc.speciesSlug ? speciesIdBySlug.get(doc.speciesSlug) ?? null : null;

  const existing = await sql`
    SELECT id FROM documents WHERE content_hash = ${contentHash} LIMIT 1
  `;

  if (existing[0]?.id) {
    await sql`
      UPDATE documents
      SET
        source_id = ${sourceId},
        title = ${doc.title},
        doc_type = ${doc.reportKind === "harvest_report" ? "harvest_report" : "draw_report"},
        state_id = ${stateId},
        species_id = ${speciesId},
        year = ${TARGET_YEAR},
        url = ${doc.url},
        metadata = ${JSON.stringify(doc.metadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${existing[0].id}
    `;
    return { action: "updated" as const, embedded: false };
  }

  const embedding = await embedText(`${doc.title}\n\n${content}`);
  const inserted = await sql`
    INSERT INTO documents (
      source_id, title, content, doc_type, state_id, species_id, year,
      url, metadata, content_hash, freshness_score, created_at, updated_at
    ) VALUES (
      ${sourceId}, ${doc.title}, ${content.slice(0, 50000)},
      ${doc.reportKind === "harvest_report" ? "harvest_report" : "draw_report"},
      ${stateId}, ${speciesId}, ${TARGET_YEAR},
      ${doc.url}, ${JSON.stringify(doc.metadata)}::jsonb, ${contentHash}, ${1.0}, NOW(), NOW()
    )
    RETURNING id
  `;

  if (embedding && inserted[0]?.id) {
    const arrayLiteral = `{${embedding.join(",")}}`;
    await sql`UPDATE documents SET embedding = ${arrayLiteral}::real[] WHERE id = ${inserted[0].id}`;
  }

  return { action: "inserted" as const, embedded: Boolean(embedding) };
}

async function main() {
  const sourceId = await ensureSourceId();
  const { stateId, speciesIdBySlug } = await getStateAndSpeciesIds();
  const bonusDocs = await fetchBonusDocs();
  const harvestDocs = await fetchHarvestDocs();
  const docs = [...bonusDocs, ...harvestDocs];

  console.log(`Found ${bonusDocs.length} bonus point PDFs and ${harvestDocs.length} harvest PDFs`);

  let inserted = 0;
  let updated = 0;
  let embedded = 0;

  for (const doc of docs) {
    console.log(`Processing ${doc.url}`);
    const result = await upsertDocument(sourceId, stateId, speciesIdBySlug, doc);
    if (result.action === "inserted") inserted += 1;
    if (result.action === "updated") updated += 1;
    if (result.embedded) embedded += 1;
  }

  console.log(`Done. inserted=${inserted} updated=${updated} embedded=${embedded}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
