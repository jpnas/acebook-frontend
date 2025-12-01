"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";

interface RoleGateProps {
  allow: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({ allow, fallback = null, children }: RoleGateProps) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return fallback ?? null;
  }
  return <>{children}</>;
}
