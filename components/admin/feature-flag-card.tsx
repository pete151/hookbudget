"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { FeatureFlagView } from "@/services/admin/feature-flag.service";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toggleFeatureFlagAction } from "@/actions/admin/feature-flags";

/** Carte de feature flag avec bascule (activation sans redéploiement). */
export function FeatureFlagCard({
  flag,
  canManage,
}: {
  flag: FeatureFlagView;
  canManage: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = React.useState(flag.enabled);
  const [pending, startTransition] = React.useTransition();

  function toggle(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      const res = await toggleFeatureFlagAction({ id: flag.id, key: flag.key, enabled: next });
      if (!res.success) {
        setEnabled(!next);
        toast.error(res.error);
        return;
      }
      toast.success(`« ${flag.label} » ${next ? "activé" : "désactivé"}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{flag.label}</h3>
            <Badge variant="outline" className="font-mono text-[10px]">
              {flag.key}
            </Badge>
          </div>
          {flag.description && (
            <p className="text-muted-foreground mt-1 text-xs">{flag.description}</p>
          )}
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={toggle}
          disabled={!canManage || pending}
          aria-label={`Activer ${flag.label}`}
        />
      </CardContent>
    </Card>
  );
}
