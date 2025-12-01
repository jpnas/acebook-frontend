"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/auth-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="bottom-center" richColors />
    </AuthProvider>
  );
}
