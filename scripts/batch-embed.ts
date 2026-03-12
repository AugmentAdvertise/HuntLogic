/**
 * Batch embed all documents that have content but no embedding.
 * Usage: GEMINI_API_KEY=... npx tsx scripts/batch-embed.ts
 */
import postgres from "postgres";
import { GoogleGenAI } from "@google/genai";

const sql = postgres(process.env.DATABASE_URL || "");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BATCH_SIZE = 20;
const DELAY_MS = 1000; // 1s between batches to stay under rate limits

async function main() {
  const countResult = await sql`
    SELECT COUNT(*) as cnt FROM documents
    WHERE content IS NOT NULL AND embedding IS NULL
  `;
  const total = Number(countResult[0].cnt);
  console.log(`Documents to embed: ${total}`);

  if (total === 0) {
    console.log("Nothing to do.");
    await sql.end();
    return;
  }

  let embedded = 0;
  let errors = 0;

  while (true) {
    const docs = await sql`
      SELECT id, title, content FROM documents
      WHERE content IS NOT NULL AND embedding IS NULL
      LIMIT ${BATCH_SIZE}
    `;

    if (docs.length === 0) break;

    // Gemini supports batch embedding via array of contents
    const inputs = docs.map((doc) => {
      const text = [doc.title, doc.content].filter(Boolean).join("\n\n");
      return text.slice(0, 32_000);
    });

    try {
      const result = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: inputs,
        config: { outputDimensionality: 768 },
      });

      for (let i = 0; i < docs.length; i++) {
        const embedding = result.embeddings![i]!.values!;
        await sql`
          UPDATE documents
          SET embedding = ${sql.array(embedding, "real")},
              updated_at = NOW()
          WHERE id = ${docs[i].id}
        `;
        embedded++;
      }

      console.log(`Embedded ${embedded}/${total} (batch of ${docs.length})`);
    } catch (err: any) {
      console.error(`Batch error: ${err.message}`);
      errors++;
      if (errors > 5) {
        console.error("Too many errors, stopping.");
        break;
      }
    }

    if (docs.length === BATCH_SIZE) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  const finalCount = await sql`SELECT COUNT(*) as cnt FROM documents WHERE embedding IS NOT NULL`;
  console.log(`\nDone. Embedded: ${embedded}, Errors: ${errors}`);
  console.log(`Total documents with embeddings: ${finalCount[0].cnt}`);

  await sql.end();
}

main().catch(console.error);
