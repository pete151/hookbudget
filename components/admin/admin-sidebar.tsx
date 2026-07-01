"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { ADMIN_NAV } from "@/lib/config/admin-nav";
import type { AdminPermission } from "@/lib/admin/rbac";
import { useSidebarStore } from "@/store/use-sidebar-store";

function Brand() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        HookBudget <span className="text-muted-foreground text-xs">Admin</span>
      </span>
    </Link>
  );
}

function Nav({
  permissions,
  onNavigate,
}: {
  permissions: AdminPermission[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => permissions.includes(item.permission));

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar du Back Office (desktop fixe + drawer mobile). */
export function AdminSidebar({ permissions }: { permissions: AdminPermission[] }) {
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r lg:block">
        <div className="flex h-full flex-col gap-6 py-5">
          <Brand />
          <Nav permissions={permissions} />
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
            onClick={close}
          />
          <div className="border-sidebar-border bg-sidebar absolute top-0 left-0 h-full w-64 border-r shadow-xl">
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={close}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent absolute top-4 right-3 rounded-md p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-full flex-col gap-6 py-5">
              <Brand />
              <Nav permissions={permissions} onNavigate={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
