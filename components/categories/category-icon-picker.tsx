"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORY_ICON_NAMES, getCategoryIcon } from "@/lib/config/category-icons";
import { cn } from "@/lib/utils/cn";

/** Sélecteur d'icône (≥ 40 icônes Lucide) piloté par le nom kebab-case. */
export function CategoryIconPicker({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (name: string) => void;
  color?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = getCategoryIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          aria-label="Choisir une icône"
        >
          <span className="flex items-center gap-2">
            {React.createElement(current, { className: "h-4 w-4", style: { color } })}
            <span className="text-muted-foreground text-sm">{value}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <ScrollArea className="h-56">
          <div className="grid grid-cols-6 gap-1 pr-2">
            {CATEGORY_ICON_NAMES.map((name) => {
              const icon = getCategoryIcon(name);
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                    "hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    selected && "bg-accent ring-primary ring-2",
                  )}
                >
                  {React.createElement(icon, {
                    className: "h-4 w-4",
                    style: { color: selected ? color : undefined },
                  })}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
