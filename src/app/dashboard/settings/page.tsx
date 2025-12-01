"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <RoleGate
      allow={["admin"]}
      fallback={(
        <div className="rounded-3xl border border-dashed bg-white/80 p-10 text-center text-sm text-muted-foreground">
          Apenas administradores podem visualizar esta área.
        </div>
      )}
    >
      <div className="space-y-6">
        <Card className="border-none bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle>Operações e webhooks</CardTitle>
            <CardDescription>Configuração base para integrar o backend Django com o painel Next.js.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label>URL do backend</Label>
              <Input
                name="api"
                defaultValue={process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api"}
              />
              <Label>Token de serviço</Label>
              <Input placeholder="sk_live_..." />
              <Label>Webhook de reservas</Label>
              <Input placeholder="https://backend/api/webhooks/reservations/" />
            </div>
            <div className="space-y-3">
              <Label>Mensagem de indisponibilidade</Label>
              <Textarea rows={4} defaultValue="Estamos atualizando as quadras, voltamos logo." />
              <Label>Listas de espera</Label>
              <Textarea rows={4} placeholder="Instruções para alunos aguardando confirmação" />
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
