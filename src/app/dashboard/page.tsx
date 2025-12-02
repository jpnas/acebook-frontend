"use client";

import Link from "next/link";
import { CalendarDays, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

const shortcuts = [
  {
    title: "Reservas",
    description: "Faça suas reservas e veja seu histórico completo.",
    href: "/dashboard/reservations",
    icon: CalendarDays,
    cta: "Abrir reservas",
  },
  {
    title: "Quadras",
    description:
      "Consulte o tipo de piso e o horário de funcionamento antes de reservar.",
    href: "/dashboard/courts",
    icon: ClipboardCheck,
    cta: "Ver quadras",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }
  return <PlayerDashboard />;
}

function PlayerDashboard() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border bg-white/80 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          AceBook
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          Bem-vindo de volta!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione uma das opções abaixo para gerenciar suas reservas ou
          conhecer mais sobre as quadras.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-none bg-white/90 shadow-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon className="size-6 text-primary" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="mt-2">
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function AdminDashboard() {
  const shortcuts = [
    {
      title: "Reservas",
      description: "Gerencie a agenda de reservas.",
      href: "/dashboard/reservations",
      cta: "Abrir reservas",
    },
    {
      title: "Quadras",
      description: "Atualize informações sobre as quadras.",
      href: "/dashboard/courts",
      cta: "Configurar quadras",
    },
    {
      title: "Jogadores",
      description: "Gerencie os jogadores do clube.",
      href: "/dashboard/users",
      cta: "Gerenciar jogadores",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            Bem-vindo ao painel do clube
          </CardTitle>
          <CardDescription>
            Escolha uma área para administrar operações diárias.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {shortcuts.map((item) => (
            <Card key={item.title} className="border bg-white shadow-sm">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
