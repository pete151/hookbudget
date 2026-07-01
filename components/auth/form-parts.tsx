/**
 * Petits éléments partagés par les formulaires d'authentification.
 */

/** Séparateur « Ou continuer avec » entre les boutons sociaux et le formulaire. */
export function AuthDivider({ label = "Ou continuer avec l'e-mail" }: { label?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="border-border w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-card text-muted-foreground px-2">{label}</span>
      </div>
    </div>
  );
}

/** Message d'erreur d'un champ (affiché sous le champ concerné). */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs font-medium">{message}</p>;
}
