"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login({ identifier: email, password });
      toast.success("Login realizado com sucesso");
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível entrar";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <AuthCard
      title="Bem-vindo"
      description="Use seu email cadastrado para acessar o Acebook."
      footer={
        <>
          <Button asChild variant="outline" className="w-full mt-2 mb-2">
            <Link href="/register/player">Criar conta</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/register/admin"
              className="text-primary hover:underline"
            >
              Criar clube
            </Link>
          </p>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="player-email">Email</Label>
          <Input
            id="player-email"
            name="email"
            type="text"
            placeholder="jogador@acebook.club"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Link
            href="/forgot-password"
            className="text-primary text-xs mt-1 block hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
