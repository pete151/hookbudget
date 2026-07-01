import { createElement } from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";

import { cn } from "@/lib/utils/cn";
import { NOTIFICATION_TYPE_META } from "@/lib/config/notification-config";

const ICONS: Record<NotificationType, LucideIcon> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  BUDGET: Wallet,
  SAVING: Target,
  INCOME: TrendingUp,
  EXPENSE: TrendingDown,
  SYSTEM: Bell,
};

/** Pastille d'icône colorée selon le type de notification. */
export function NotificationIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  const icon = ICONS[type];
  const color = NOTIFICATION_TYPE_META[type].color;

  return (
    <span
      className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", className)}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {createElement(icon, { className: "h-4 w-4" })}
    </span>
  );
}
