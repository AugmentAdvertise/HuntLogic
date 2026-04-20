"use client";

import { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  aiName?: string;
}

const defaultAiName = process.env.NEXT_PUBLIC_AI_ASSISTANT_NAME || "Grizz";

export function ChatInput({
  onSend,
  disabled,
  aiName = defaultAiName,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  };

  return (
    <div
      className="z-10 border-t border-brand-sage/10 bg-white/98 px-4 pt-2 shadow-[0_-8px_24px_rgba(34,33,27,0.06)] backdrop-blur-md dark:border-brand-sage/20 dark:bg-brand-bark/98"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-brand-bark/75 dark:text-brand-cream/75">
          Message {aiName}
        </span>
        <span className="text-[11px] text-brand-sage">
          Enter to send, Shift+Enter for a new line
        </span>
      </div>
      <div className="flex items-end gap-2 rounded-2xl border border-brand-sage/15 bg-brand-cream/65 p-2 shadow-sm dark:border-brand-sage/25 dark:bg-brand-bark/70">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask about draw odds, units, strategy, seasons, or costs..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border border-transparent bg-white/80 px-4 py-3 text-sm text-brand-bark shadow-sm",
            "placeholder:text-brand-sage/60 focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/20",
            "dark:bg-brand-bark/60 dark:text-brand-cream dark:focus:border-brand-sage",
            "disabled:opacity-50",
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
            value.trim() && !disabled
              ? "bg-brand-forest text-white hover:bg-brand-forest/90 dark:bg-brand-sage"
              : "bg-brand-sage/10 text-brand-sage/40 dark:bg-brand-sage/20",
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
