import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  /** Titre de la carte (ex. « Connexion »). */
  title: string;
  /** Sous-titre explicatif. */
  description?: string;
  /** Contenu principal (formulaire). */
  children: React.ReactNode;
  /** Texte du lien de pied de carte (ex. « Pas encore de compte ? »). */
  footerText?: string;
  /** Libellé du lien de pied de carte (ex. « Créer un compte »). */
  footerLinkLabel?: string;
  /** Destination du lien de pied de carte. */
  footerLinkHref?: string;
}

/**
 * Carte d'authentification réutilisable (connexion, inscription, mot de passe…).
 * Uniformise la mise en page de toutes les pages d'auth.
 */
export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footerText && footerLinkLabel && footerLinkHref && (
        <CardFooter className="text-muted-foreground justify-center text-sm">
          {footerText}
          <Link href={footerLinkHref} className="text-primary ml-1 font-medium hover:underline">
            {footerLinkLabel}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
