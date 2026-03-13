// =============================================================================
// Chat API — AI Concierge Streaming Endpoint
// =============================================================================
// POST /api/v1/chat — Send message, get streaming Claude response with RAG
// =============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { streamMessage, type ChatMessage } from "@/lib/ai/client";
import { assembleContext } from "@/lib/ai/rag";
import { loadPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { message, history = [] } = body as {
    message: string;
    history: ChatMessage[];
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Load concierge prompt template
  const prompt = await loadPrompt("concierge");
  const systemPrompt = prompt?.systemPrompt ?? "";

  // Retrieve RAG context for the user's question
  let ragContext = "";
  try {
    ragContext = await assembleContext(message.trim(), 3);
  } catch (err) {
    console.warn("[chat] RAG context unavailable:", err instanceof Error ? err.message : String(err));
  }

  // Build system prompt with RAG context
  const fullSystemPrompt = ragContext
    ? `${systemPrompt}\n\nYou have access to the following state agency data. Reference it when relevant, but don't force it if the user's question is unrelated.\n\n${ragContext}`
    : systemPrompt;

  // Build message history (keep last 20 messages for context window)
  const messages: ChatMessage[] = [
    ...history.slice(-20),
    { role: "user", content: message.trim() },
  ];

  // Stream response
  const stream = await streamMessage({
    messages,
    systemPrompt: fullSystemPrompt,
    maxTokens: prompt?.maxTokens ?? 4096,
    temperature: prompt?.temperature ?? 0.7,
  });

  // Convert Anthropic stream to ReadableStream for the browser
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Use POST to chat with the concierge" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
