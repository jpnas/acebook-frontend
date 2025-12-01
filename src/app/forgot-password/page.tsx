"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetInfo, setResetInfo] = useState<{
    uid?: string;
    token?: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.auth.forgotPassword({ email });
      toast.success(data.detail);
      setResetInfo({ uid: data.uid, token: data.token });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o processo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      description="Insira seu email e enviaremos as instruções."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="recover-email">Email cadastrado</Label>
          <Input
            id="recover-email"
            type="email"
            placeholder="voce@acebook.club"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Usamos esse endereço para validar sua identidade e enviar o link
            exclusivo.
          </p>
        </div>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar link seguro"}
        </Button>
        {resetInfo?.token && resetInfo?.uid ? (
          <div className="space-y-1 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm">
            <p className="font-semibold text-foreground">Credenciais geradas</p>
            <p>
              UID: <code className="text-xs font-mono">{resetInfo.uid}</code>
            </p>
            <p>
              Token:{" "}
              <code className="text-xs font-mono">{resetInfo.token}</code>
            </p>
            <p className="mt-2 text-muted-foreground">
              Em produção você receberia isso por email. Para testar localmente,
              use esses dados na página de redefinição.
            </p>
          </div>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">
          Já lembrou?{" "}
          <Link href="/" className="text-primary">
            Voltar para o login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
