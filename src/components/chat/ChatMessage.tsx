"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-brand-forest text-brand-cream"
            : "bg-brand-sage/20 dark:bg-brand-sage/30"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <span className="text-base">🐻</span>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand-forest text-white dark:bg-brand-sage"
            : "bg-brand-cream/60 text-brand-bark dark:bg-brand-bark/60 dark:text-brand-cream/90"
        )}
      >
        {content}
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-1 motion-safe:animate-pulse bg-brand-forest/60 dark:bg-brand-cream/60" />
        )}
      </div>
    </div>
  );
}
