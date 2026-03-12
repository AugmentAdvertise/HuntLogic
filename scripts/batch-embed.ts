/**
 * Batch embed all documents that have content but no embedding.
 * Usage: OPENAI_API_KEY=sk-... npx tsx scripts/batch-embed.ts
 */
import postgres from "postgres";
import OpenAI from "openai";

const sql = postgres(process.env.DATABASE_URL || "");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // Prepare batch input
    const inputs = docs.map((doc) => {
      const text = [doc.title, doc.content].filter(Boolean).join("\n\n");
      return text.slice(0, 32_000);
    });

    try {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputs,
        dimensions: 1536,
      });

      // Update each document
      for (let i = 0; i < docs.length; i++) {
        const embedding = result.data[i]!.embedding;
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

    // Rate limit delay
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
