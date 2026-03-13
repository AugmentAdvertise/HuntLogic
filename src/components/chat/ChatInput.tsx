"use client";

import { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
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
    <div className="border-t border-brand-sage/10 bg-white/95 backdrop-blur-md px-4 py-3 dark:bg-brand-bark/95 dark:border-brand-sage/20">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask your hunting guide..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-[10px] border border-[#E0DDD5] bg-brand-cream/30 px-4 py-2.5 text-sm text-brand-bark",
            "placeholder:text-brand-sage/50 focus:border-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-forest/30",
            "dark:bg-brand-bark/50 dark:text-brand-cream dark:border-brand-sage/30 dark:focus:border-brand-sage",
            "disabled:opacity-50"
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            value.trim() && !disabled
              ? "bg-brand-forest text-white hover:bg-brand-forest/90 dark:bg-brand-sage"
              : "bg-brand-sage/10 text-brand-sage/40 dark:bg-brand-sage/20"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
