"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Fournit le contexte de thème (clair / sombre / système) via `next-themes`.
 * Appliqué dans le layout racine. Le basculement se fait par la classe `dark`
 * sur `<html>`, en accord avec les tokens définis dans `app/globals.css`.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
