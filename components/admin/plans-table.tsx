"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import type { PlanView } from "@/services/admin/plan.service";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { togglePlanAction, upsertPlanAction } from "@/actions/admin/plans";

function limitLabel(n: number | null): string {
  return n === null ? "∞" : String(n);
}

/** Tableau des plans commerciaux avec édition (aucun paiement réel). */
export function PlansTable({ plans, canManage }: { plans: PlanView[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<PlanView | null>(null);
  const [pending, startTransition] = React.useTransition();

  function toggle(plan: PlanView, isActive: boolean) {
    startTransition(async () => {
      const res = await togglePlanAction({ id: plan.id, isActive });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Plan ${isActive ? "activé" : "désactivé"}`);
      router.refresh();
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Budgets / Objectifs</TableHead>
              <TableHead>Actif</TableHead>
              {canManage && <TableHead className="text-right">Éditer</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge variant="outline">{p.tier}</Badge>
                  </div>
                  {p.description && (
                    <p className="text-muted-foreground text-xs">{p.description}</p>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {p.price === 0
                    ? "Gratuit"
                    : `${formatCurrency(p.price, p.currency)} / ${p.interval === "year" ? "an" : "mois"}`}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {limitLabel(p.maxBudgets)} / {limitLabel(p.maxGoals)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={p.isActive}
                    onCheckedChange={(v) => toggle(p, v)}
                    disabled={!canManage || pending}
                    aria-label={`Activer ${p.name}`}
                  />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditing(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <PlanDialog
          plan={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function PlanDialog({
  plan,
  open,
  onOpenChange,
  onSaved,
}: {
  plan: PlanView;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState(plan.name);
  const [price, setPrice] = React.useState(String(plan.price));
  const [currency, setCurrency] = React.useState(plan.currency);
  const [features, setFeatures] = React.useState(plan.features.join("\n"));
  const [description, setDescription] = React.useState(plan.description ?? "");
  const [isActive, setIsActive] = React.useState(plan.isActive);
  const [pending, startTransition] = React.useTransition();

  function submit() {
    startTransition(async () => {
      const res = await upsertPlanAction({
        tier: plan.tier,
        name,
        price: Number(price) || 0,
        currency,
        interval: plan.interval,
        maxBudgets: plan.maxBudgets,
        maxGoals: plan.maxGoals,
        maxAiChats: plan.maxAiChats,
        features: features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        isActive,
        description,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Plan mis à jour");
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Éditer le plan {plan.tier}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Nom</Label>
            <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-price">Prix</Label>
              <Input
                id="plan-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-currency">Devise</Label>
              <Input
                id="plan-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-features">Fonctionnalités (une par ligne)</Label>
            <Textarea
              id="plan-features"
              rows={4}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-desc">Description</Label>
            <Input
              id="plan-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="plan-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="plan-active">Plan actif</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
