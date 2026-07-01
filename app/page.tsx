import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Suivi des revenus",
    description: "Centralisez toutes vos sources de revenus en un seul endroit.",
  },
  {
    icon: Wallet,
    title: "Gestion des dépenses",
    description: "Catégorisez vos dépenses et gardez le contrôle de votre argent.",
  },
  {
    icon: PiggyBank,
    title: "Budgets intelligents",
    description: "Créez des budgets adaptés à votre rythme de vie.",
  },
  {
    icon: Target,
    title: "Objectifs d'épargne",
    description: "Fixez des objectifs et suivez votre progression mois après mois.",
  },
  {
    icon: BarChart3,
    title: "Statistiques claires",
    description: "Visualisez vos finances grâce à des graphiques lisibles.",
  },
  {
    icon: Sparkles,
    title: "Recommandations IA",
    description: "Recevez des conseils personnalisés pour mieux gérer votre budget.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Barre de navigation publique */}
      <header className="border-border bg-background/80 sticky top-0 z-30 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">HookBudget</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Commencer</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Section héro */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="border-border bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Votre argent, enfin sous contrôle
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Gérez votre budget <span className="text-primary">intelligemment</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            HookBudget aide particuliers, étudiants, salariés et entrepreneurs à suivre leurs
            revenus, maîtriser leurs dépenses et atteindre leurs objectifs d&apos;épargne.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Créer un compte gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Voir le tableau de bord</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <span className="bg-accent text-accent-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-border mt-auto border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 text-center text-sm sm:px-6">
          © {new Date().getFullYear()} HookBudget. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
