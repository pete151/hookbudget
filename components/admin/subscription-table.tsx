import type { SubscriptionRow } from "@/services/admin/subscription.service";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  TRIAL: "Essai",
  CANCELLED: "Annulé",
  PAST_DUE: "Impayé",
};

/** Tableau des abonnements (lecture seule). */
export function SubscriptionTable({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  if (subscriptions.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Aucun abonnement.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Fin de période</TableHead>
            <TableHead className="text-right">Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <p className="text-sm font-medium">{s.user.name}</p>
                <p className="text-muted-foreground text-xs">{s.user.email}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{s.plan}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>
                  {STATUS_LABELS[s.status] ?? s.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-right text-sm">
                {formatDate(s.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
