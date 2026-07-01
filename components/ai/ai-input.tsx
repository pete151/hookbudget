"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Zone de saisie du chat IA (contrôlée) avec suggestions optionnelles. */
export function AIInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  suggestions = [],
  onPickSuggestion,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  suggestions?: string[];
  onPickSuggestion?: (q: string) => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  return (
    <div className="space-y-2">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => onPickSuggestion?.(s)}
              className="border-border text-muted-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez une question sur vos finances…"
          rows={1}
          disabled={disabled}
          className="max-h-32 min-h-10 resize-none"
        />
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
