"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function PlayerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    clubSlug: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas precisam ser iguais.");
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "player",
        club_slug: form.clubSlug,
      });
      toast.success("Conta criada! Faça login com suas credenciais.");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Crie sua conta"
      description="Conecte-se às quadras e instrutores do seu clube."
      backLink={{ href: "/", label: "Voltar" }}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="player-name">Nome completo</Label>
          <Input
            id="player-name"
            name="name"
            placeholder="Seu nome"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="player-email">Email</Label>
          <Input
            id="player-email"
            name="email"
            type="email"
            placeholder="voce@email.com"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="player-club">Código do clube</Label>
          <Input
            id="player-club"
            name="clubSlug"
            placeholder="ex: clube-central"
            required
            value={form.clubSlug}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="player-password">Senha</Label>
          <Input
            id="player-password"
            name="password"
            type="password"
            placeholder="********"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="player-password-confirm">Confirmar senha</Label>
          <Input
            id="player-password-confirm"
            name="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Criando..." : "Criar conta"}
        </Button>
      </form>
    </AuthCard>
  );
}
