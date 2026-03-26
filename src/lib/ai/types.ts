export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: Date;
}

export interface Citation {
  id: string;
  source: string; // e.g. "Utah Elk Regulations 2024"
  page?: number;
  excerpt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  unitId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeChunk {
  id: string;
  sourceType: "regulation" | "unit_data" | "species";
  sourceId: string;
  state?: string;
  species?: string;
  unitId?: string;
  content: string;
  metadata?: Record<string, unknown>;
}
