"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessageSquare, Lightbulb, History } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { label: "Aperçu", href: "/dashboard/ai", icon: LayoutGrid },
  { label: "Chat", href: "/dashboard/ai/chat", icon: MessageSquare },
  { label: "Insights", href: "/dashboard/ai/insights", icon: Lightbulb },
  { label: "Historique", href: "/dashboard/ai/history", icon: History },
];

/** Onglets de navigation de la section Assistant IA. */
export function AiNav() {
  const pathname = usePathname();

  return (
    <nav className="border-border flex gap-1 overflow-x-auto border-b">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active
                ? "border-primary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
