"use client";

import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";
import { DashboardSidebar } from "./dashboard-sidebar";

const roleLabel: Record<UserRole, string> = {
  player: "Atleta",
  admin: "Administrador",
};

export function DashboardNav() {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? user?.email ?? "Usuário";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-[13.5px] lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" aria-label="Abrir menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <DashboardSidebar variant="drawer" />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden flex-col text-right lg:flex">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Bem-vindo(a),
            </span>
            <span className="font-semibold text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {user ? roleLabel[user.role] : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
