import { redirect } from "next/navigation";

/** Redirige la racine des paramètres vers le profil. */
export default function SettingsIndexPage() {
  redirect("/dashboard/settings/profile");
}
