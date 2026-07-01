import Link from "next/link";
import { Wallet } from "lucide-react";

/**
 * Layout des pages d'authentification (connexion / inscription).
 * Centre le contenu et affiche le logo. Aucune logique d'auth ici.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-full flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg">
          <Wallet className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">HookBudget</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
