import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Indicateur « l'IA analyse / rédige » (points animés). */
export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="L'assistant rédige">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Bulle de message dans le chat IA. */
export function AIMessage({
  role,
  content,
  streaming = false,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <span className="bg-primary/15 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Sparkles className="h-4 w-4" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {content || (streaming ? <TypingDots /> : null)}
      </div>
    </div>
  );
}
