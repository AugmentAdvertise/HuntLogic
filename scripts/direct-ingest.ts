/**
 * Direct ingestion: fetch → parse → store documents → embed
 * Bypasses BullMQ (no Redis needed). Runs locally against Railway Postgres.
 * Usage: npx tsx scripts/direct-ingest.ts
 */
import postgres from "postgres";
import { GoogleGenAI } from "@google/genai";
import * as crypto from "crypto";

const sql = postgres(process.env.DATABASE_URL || "");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const USER_AGENT = "Mozilla/5.0 HuntLogic/1.0";

interface Source {
  id: string;
  name: string;
  scraper_config: any;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`    SKIP: HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err: any) {
    console.log(`    SKIP: ${err.message} for ${url}`);
    return null;
  }
}

async function embedText(text: string): Promise<number[] | null> {
  const truncated = text.slice(0, 32_000);
  if (truncated.length < 50) return null;

  try {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: truncated,
      config: { outputDimensionality: 768 },
    });
    return result.embeddings?.[0]?.values ?? null;
  } catch (err: any) {
    console.log(`    Embed error: ${err.message}`);
    return null;
  }
}

async function main() {
  const sources = await sql`
    SELECT id, name, scraper_config, url FROM data_sources
    WHERE enabled = true
    ORDER BY name
  `;

  console.log(`Found ${sources.length} active data sources\n`);

  let totalDocs = 0;
  let totalEmbedded = 0;

  for (const source of sources) {
    console.log(`\n=== ${source.name} ===`);
    const config = source.scraper_config as any;
    const baseUrl = source.url || "";
    const endpoints = config?.endpoints || [];

    if (endpoints.length === 0) {
      console.log("  No endpoints configured");
      continue;
    }

    for (const ep of endpoints) {
      try {
      let url: string;
      if (ep.path?.startsWith("http")) {
        url = ep.path;
      } else {
        // Join with domain origin only (not the full base URL path)
        const origin = new URL(baseUrl).origin;
        const path = ep.path?.startsWith("/") ? ep.path : `/${ep.path}`;
        url = `${origin}${path}`;
      }

      console.log(`  Fetching: ${url}`);

      // Skip PDF endpoints
      if (url.match(/\.(pdf)($|\?)/i) || (url.includes("/media/") && url.includes("download"))) {
        console.log("    SKIP: PDF endpoint (handled by worker)");
        continue;
      }

      let content: string | null;
      try {
        content = await fetchPage(url);
      } catch (err: any) {
        console.log(`    SKIP: fetch error — ${err.message}`);
        continue;
      }
      if (!content) continue;

      // Skip binary content (null bytes = not text)
      if (content.includes("\0")) {
        console.log("    SKIP: binary content detected");
        continue;
      }

      // Build document
      const contentHash = crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");

      // Check for duplicate
      const existing = await sql`
        SELECT id FROM documents WHERE content_hash = ${contentHash} LIMIT 1
      `;
      if (existing.length > 0) {
        console.log("    SKIP: duplicate (content hash match)");
        continue;
      }

      // Determine doc type
      const docType = ep.doc_type || config.doc_type || "regulation";

      // Extract title from HTML
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch?.[1]?.trim() || `${source.name} — ${ep.path}`;

      // Strip HTML tags for plain text content
      const plainText = content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (plainText.length < 100) {
        console.log(`    SKIP: content too short (${plainText.length} chars)`);
        continue;
      }

      // Look up state from source name
      let stateId: string | null = null;
      if (source.name.includes("WGFD")) {
        const st = await sql`SELECT id FROM states WHERE code = 'WY' LIMIT 1`;
        stateId = st[0]?.id || null;
      } else if (source.name.includes("AZGFD")) {
        const st = await sql`SELECT id FROM states WHERE code = 'AZ' LIMIT 1`;
        stateId = st[0]?.id || null;
      } else if (source.name.includes("CPW")) {
        const st = await sql`SELECT id FROM states WHERE code = 'CO' LIMIT 1`;
        stateId = st[0]?.id || null;
      }

      // Generate embedding
      const embeddingText = `${title}\n\n${plainText}`;
      const embedding = await embedText(embeddingText);

      // Insert document (embedding as separate UPDATE to avoid array formatting issues)
      const [doc] = await sql`
        INSERT INTO documents (
          source_id, title, content, doc_type, state_id,
          url, content_hash, metadata,
          created_at, updated_at
        ) VALUES (
          ${source.id}, ${title}, ${plainText.slice(0, 50000)}, ${docType}, ${stateId},
          ${url}, ${contentHash}, ${JSON.stringify({ parser: "direct-ingest" })}::jsonb,
          NOW(), NOW()
        )
        RETURNING id
      `;

      // Update embedding via raw SQL to handle real[] properly
      if (embedding && doc) {
        const arrayLiteral = `{${embedding.join(",")}}`;
        await sql`UPDATE documents SET embedding = ${arrayLiteral}::real[] WHERE id = ${doc.id}`;
      }

      totalDocs++;
      if (embedding) totalEmbedded++;

      console.log(
        `    ✓ Stored: "${title.slice(0, 60)}" (${plainText.length} chars, ${embedding ? "embedded" : "no embedding"})`
      );

      // Small delay for rate limits
      await new Promise((r) => setTimeout(r, 500));
      } catch (err: any) {
        console.log(`    ERROR: ${err.message?.slice(0, 120)}`);
      }
    }

    // Update source last_fetched
    await sql`
      UPDATE data_sources SET last_fetched = NOW(), last_success = NOW(), status = 'active'
      WHERE id = ${source.id}
    `;
  }

  // Summary
  const docCount = await sql`SELECT COUNT(*) as cnt FROM documents`;
  const embedCount = await sql`SELECT COUNT(*) as cnt FROM documents WHERE embedding IS NOT NULL`;

  console.log(`\n=== SUMMARY ===`);
  console.log(`Documents inserted: ${totalDocs}`);
  console.log(`Documents embedded: ${totalEmbedded}`);
  console.log(`Total documents in DB: ${docCount[0].cnt}`);
  console.log(`Total with embeddings: ${embedCount[0].cnt}`);

  await sql.end();
}

main().catch(console.error);
