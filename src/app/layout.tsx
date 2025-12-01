import type { Metadata } from "next";

import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "AceBook | Gestão inteligente de quadras de tênis",
    template: "%s | AceBook",
  },
  description:
    "Plataforma completa para reservas, operações e relacionamento com atletas em academias de tênis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
