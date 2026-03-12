/**
 * Test embedding generation and cosine similarity search.
 * Usage: OPENAI_API_KEY=sk-... npx tsx scripts/test-embedding.ts
 */
import postgres from "postgres";
import OpenAI from "openai";

const sql = postgres(process.env.DATABASE_URL || "");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  // 1. Test embedding generation
  console.log("--- Generating test embedding ---");
  const testText = "Wyoming elk draw odds for nonresident hunters in 2025";
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: testText,
    dimensions: 1536,
  });
  const embedding = result.data[0]!.embedding;
  console.log(`Generated ${embedding.length}-dim embedding for: "${testText}"`);
  console.log(`First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(6)).join(", ")}]`);

  // 2. Embed a test document
  console.log("\n--- Embedding a document ---");
  const docs = await sql`
    SELECT id, title, content FROM documents
    WHERE content IS NOT NULL AND embedding IS NULL
    LIMIT 1
  `;

  if (docs.length > 0) {
    const doc = docs[0];
    const docText = [doc.title, doc.content].filter(Boolean).join("\n\n");
    const truncated = docText.slice(0, 32_000);

    const docResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: truncated,
      dimensions: 1536,
    });
    const docEmbedding = docResult.data[0]!.embedding;

    await sql`
      UPDATE documents
      SET embedding = ${sql.array(docEmbedding, "real")},
          updated_at = NOW()
      WHERE id = ${doc.id}
    `;
    console.log(`Embedded document ${doc.id}: "${doc.title}" (${truncated.length} chars)`);
  } else {
    console.log("No un-embedded documents found (all embedded or none exist)");
  }

  // 3. Test cosine similarity search
  console.log("\n--- Testing cosine similarity search ---");
  const embeddedCount = await sql`SELECT COUNT(*) as cnt FROM documents WHERE embedding IS NOT NULL`;
  console.log(`Documents with embeddings: ${embeddedCount[0].cnt}`);

  if (Number(embeddedCount[0].cnt) > 0) {
    const embeddingLiteral = `ARRAY[${embedding.join(",")}]::real[]`;
    const searchResults = await sql.unsafe(`
      SELECT
        id,
        title,
        doc_type,
        year,
        cosine_similarity(embedding, ${embeddingLiteral}) AS score
      FROM documents
      WHERE embedding IS NOT NULL
      ORDER BY score DESC
      LIMIT 5
    `);

    console.log("\nTop results for: \"" + testText + "\"");
    for (const row of searchResults) {
      console.log(`  ${parseFloat(row.score).toFixed(4)} | ${row.title || "(no title)"} | ${row.doc_type} | ${row.year}`);
    }
  }

  // 4. Batch embed remaining documents
  const remaining = await sql`SELECT COUNT(*) as cnt FROM documents WHERE content IS NOT NULL AND embedding IS NULL`;
  console.log(`\nDocuments still needing embedding: ${remaining[0].cnt}`);

  await sql.end();
}

main().catch(console.error);
