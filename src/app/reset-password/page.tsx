"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const PASSWORD_HINT = "Use pelo menos 8 caracteres combinando letras e números.";
const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function isStrongPassword(password: string) {
  return strongPasswordRegex.test(password);
}

type ResetSearchParams = Record<string, string | string[] | undefined>;

type ResetPasswordPageProps = {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<ResetSearchParams>;
};

export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  const searchParams = props?.searchParams ? use(props.searchParams) : undefined;
  const router = useRouter();
  const tokenParam = searchParams?.token;
  const uidParam = searchParams?.uid;
  const [token, setToken] = useState(Array.isArray(tokenParam) ? tokenParam[0] ?? "" : tokenParam ?? "");
  const [uid, setUid] = useState(Array.isArray(uidParam) ? uidParam[0] ?? "" : uidParam ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas precisam coincidir.");
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error(PASSWORD_HINT);
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.resetPassword({ token, uid, password });
      toast.success("Senha atualizada com sucesso! Faça login novamente.");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível redefinir sua senha.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Concluir redefinição"
      description="Informe os dados recebidos no email e crie uma nova senha segura para continuar utilizando o clube."
      footer={
        <>
          <p className="text-center text-xs text-muted-foreground">
            Não encontrou o email? Verifique sua caixa de spam e tente reenviar o pedido em alguns minutos.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Voltar para o login</Link>
          </Button>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Copie o UID e o token exatamente como recebeu. Eles garantem que o link pertence a você.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uid">UID recebido</Label>
            <Input id="uid" value={uid} onChange={(event) => setUid(event.target.value)} placeholder="Ex: Mg" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Token recebido</Label>
            <Input
              id="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Código informado"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="********"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : "Atualizar senha"}
        </Button>
      </form>
    </AuthCard>
  );
}
