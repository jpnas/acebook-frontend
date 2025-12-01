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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.auth.forgotPassword({ email });
      toast.success(data.detail);
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
