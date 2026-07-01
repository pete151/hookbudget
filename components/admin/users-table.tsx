"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Ban, RotateCcw, Trash2 } from "lucide-react";
import type { AdminRole } from "@prisma/client";

import type { AdminUserRow } from "@/services/admin/user.service";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/rbac";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  changeUserRoleAction,
  deleteUserAction,
  reactivateUserAction,
  suspendUserAction,
} from "@/actions/admin/users";

interface Perms {
  canSuspend: boolean;
  canDelete: boolean;
  canRole: boolean;
  canAssignSuper: boolean;
}

const ROLE_OPTIONS: (AdminRole | "USER")[] = ["USER", "ANALYST", "SUPPORT", "ADMIN", "SUPER_ADMIN"];

/** Tableau de gestion des utilisateurs (rôle, suspension, suppression). */
export function UsersTable({
  users,
  perms,
  currentAdminId,
}: {
  users: AdminUserRow[];
  perms: Perms;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function run(fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) {
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        toast.error(res.error ?? "Action impossible.");
        return;
      }
      toast.success(okMsg);
      router.refresh();
    });
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Aucun utilisateur trouvé.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const isSelf = u.id === currentAdminId;
            const roleValue: AdminRole | "USER" = u.adminRole ?? "USER";
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-muted-foreground text-xs">{u.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{u.plan}</Badge>
                </TableCell>
                <TableCell>
                  {perms.canRole && !isSelf ? (
                    <Select
                      value={roleValue}
                      onValueChange={(role) =>
                        run(() => changeUserRoleAction({ userId: u.id, role }), "Rôle mis à jour")
                      }
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-36" aria-label="Rôle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.filter(
                          (r) => r !== "SUPER_ADMIN" || perms.canAssignSuper,
                        ).map((r) => (
                          <SelectItem key={r} value={r}>
                            {r === "USER" ? "Utilisateur" : ADMIN_ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={u.adminRole ? "default" : "secondary"}>
                      {u.adminRole ? ADMIN_ROLE_LABELS[u.adminRole] : "Utilisateur"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === "ACTIVE" ? "default" : "secondary"}
                    className={u.status === "SUSPENDED" ? "text-red-600" : ""}
                  >
                    {u.status === "ACTIVE" ? "Actif" : "Suspendu"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="Profil"
                    >
                      <Link href={`/admin/users/${u.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {perms.canSuspend &&
                      !isSelf &&
                      (u.status === "ACTIVE" ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Suspendre"
                          disabled={pending}
                          onClick={() =>
                            run(() => suspendUserAction({ userId: u.id }), "Utilisateur suspendu")
                          }
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Réactiver"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () => reactivateUserAction({ userId: u.id }),
                              "Utilisateur réactivé",
                            )
                          }
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ))}

                    {perms.canDelete && !isSelf && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive h-8 w-8"
                            aria-label="Supprimer"
                            disabled={pending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Suppression logique (soft delete) : le compte est désactivé et masqué,
                              les données sont conservées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                run(
                                  () => deleteUserAction({ userId: u.id }),
                                  "Utilisateur supprimé",
                                )
                              }
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
