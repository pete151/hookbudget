import type { AuditLogView } from "@/services/admin/audit.service";
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

/** Tableau du journal d'audit. */
export function AuditTable({ logs }: { logs: AuditLogView[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Aucune entrée d&apos;audit.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Cible</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {log.targetType
                  ? `${log.targetType}${log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}`
                  : "—"}
              </TableCell>
              <TableCell className="text-sm">{log.actor ? log.actor.name : "Système"}</TableCell>
              <TableCell className="text-muted-foreground text-right text-sm">
                {formatDate(log.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
