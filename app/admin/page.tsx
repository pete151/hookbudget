import { redirect } from "next/navigation";

/** `/admin` redirige vers le tableau de bord du Back Office. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
