"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Monitor, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { revokeOtherSessionsAction } from "@/actions/settings";

export interface SessionInfo {
  id: string;
  current: boolean;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

/** Liste des sessions actives + déconnexion des autres appareils. */
export function SessionsList({ sessions }: { sessions: SessionInfo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirm, setConfirm] = React.useState(false);

  function revokeAll() {
    setConfirm(false);
    startTransition(async () => {
      const res = await revokeOtherSessionsAction();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Autres appareils déconnectés");
      router.refresh();
    });
  }

  const others = sessions.filter((s) => !s.current).length;

  return (
    <div className="space-y-3">
      <ul className="divide-border divide-y">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0">
            <Monitor className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.userAgent ?? "Appareil inconnu"}</p>
              <p className="text-muted-foreground text-xs">
                {s.ipAddress ?? "IP inconnue"} · {formatDate(s.createdAt)}
              </p>
            </div>
            {s.current && <Badge variant="secondary">Cet appareil</Badge>}
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="text-destructive"
        disabled={isPending || others === 0}
        onClick={() => setConfirm(true)}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Déconnecter les autres appareils
      </Button>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter tous les autres appareils ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les sessions actives, sauf celle-ci, seront invalidées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                revokeAll();
              }}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
