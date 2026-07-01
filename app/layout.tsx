import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "HookBudget — Gérez votre budget intelligemment",
    template: "%s · HookBudget",
  },
  description:
    "HookBudget : suivez vos revenus, vos dépenses, vos budgets et vos objectifs d'épargne, avec des recommandations propulsées par l'IA.",
  applicationName: "HookBudget",
  keywords: ["budget", "finances personnelles", "épargne", "dépenses", "revenus", "SaaS", "IA"],
  authors: [{ name: "HookBudget" }],
  appleWebApp: { capable: true, title: "HookBudget", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: appUrl,
    siteName: "HookBudget",
    title: "HookBudget — Gérez votre budget intelligemment",
    description:
      "Suivez vos revenus, dépenses, budgets et objectifs d'épargne, avec un assistant financier IA.",
  },
  twitter: {
    card: "summary",
    title: "HookBudget",
    description: "Gestion de budget personnel avec assistant IA.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-center" richColors />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
