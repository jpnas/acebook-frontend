"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eclipse } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { adminNavigation, playerNavigation } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  variant?: "sidebar" | "drawer";
}

export function DashboardSidebar({
  variant = "sidebar",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItems =
    user && user.role === "admin" ? adminNavigation : playerNavigation;
  const containerClass =
    variant === "sidebar"
      ? "hidden border-r bg-sidebar lg:block"
      : "border-b bg-sidebar p-6";

  return (
    <aside className={containerClass}>
      <div
        className={cn(
          "flex items-center gap-2 border-b px-6 py-5",
          variant === "sidebar" ? "h-20" : "pb-4"
        )}
      >
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Eclipse className="size-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            AceBook
          </p>
          <p className="font-semibold text-sm text-foreground">
            {user?.club?.name ?? "Seu clube"}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <section className="space-y-1">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Navegação
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </section>
      </div>
    </aside>
  );
}
