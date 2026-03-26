import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  customType,
} from "drizzle-orm/pg-core";

// ========================
// CUSTOM TYPES
// ========================

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1024)";
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string) {
    return value
      .slice(1, -1)
      .split(",")
      .map(Number);
  },
});

// ========================
// KNOWLEDGE CHUNKS
// ========================

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: text("source_type").notNull(), // 'regulation' | 'unit_data' | 'species'
    sourceId: text("source_id").notNull(),
    state: text("state"),
    species: text("species"),
    unitId: text("unit_id"),
    content: text("content").notNull(),
    embedding: vector("embedding"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("knowledge_chunks_source_type_idx").on(table.sourceType),
    index("knowledge_chunks_state_idx").on(table.state),
  ]
);
