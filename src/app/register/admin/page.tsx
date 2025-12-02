"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { ClubSlugAvailability } from "@/lib/types";
import { cn } from "@/lib/utils";

const PASSWORD_HINT = "Use pelo menos 8 caracteres combinando letras e números.";
const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function isStrongPassword(value: string) {
  return strongPasswordRegex.test(value);
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    clubName: "",
    clubCode: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [codeInfo, setCodeInfo] = useState<ClubSlugAvailability | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeCheckError, setCodeCheckError] = useState<string | null>(null);

  const checkClubCode = useCallback(
    async (value: string): Promise<ClubSlugAvailability> => {
      const query = value.trim();
      if (!query) {
        return { slug: "", available: false, valid: false };
      }
      const { data } = await api.clubs.checkSlug(query);
      return data;
    },
    []
  );

  useEffect(() => {
    const value = form.clubCode.trim();
    if (!value) {
      setCodeInfo(null);
      setCodeCheckError(null);
      setCodeChecking(false);
      return;
    }

    let ignore = false;
    setCodeChecking(true);
    const handler = setTimeout(() => {
      checkClubCode(value)
        .then((result) => {
          if (ignore) return;
          setCodeInfo(result);
          setCodeCheckError(null);
        })
        .catch(() => {
          if (ignore) return;
          setCodeInfo(null);
          setCodeCheckError("Não foi possível verificar o código agora.");
        })
        .finally(() => {
          if (!ignore) {
            setCodeChecking(false);
          }
        });
    }, 400);

    return () => {
      ignore = true;
      clearTimeout(handler);
    };
  }, [form.clubCode, checkClubCode]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas devem ser iguais.");
      return;
    }
    if (!isStrongPassword(form.password)) {
      toast.error(PASSWORD_HINT);
      return;
    }
    if (!form.clubCode.trim()) {
      toast.error("Informe um código para o clube.");
      return;
    }
    setSubmitting(true);
    try {
      const slugStatus = await checkClubCode(form.clubCode);
      if (!slugStatus.valid) {
        toast.error("Use apenas letras, números e hífens no código do clube.");
        return;
      }
      if (!slugStatus.available) {
        toast.error("Esse código já está sendo utilizado.");
        return;
      }
      setCodeInfo(slugStatus);
      await api.auth.register({
        email: form.email,
        password: form.password,
        role: "admin",
        club_name: form.clubName,
        club_slug: slugStatus.slug,
      });
      toast.success("Clube registrado! Faça login para configurar o painel.");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o clube.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const codeHelper = (() => {
    const trimmed = form.clubCode.trim();
    if (!trimmed) {
      return {
        text: "Crie um código curto, usando letras, números ou hífens (ex: ace-tenis).",
        tone: "muted" as const,
      };
    }
    if (codeChecking) {
      return { text: "Verificando disponibilidade...", tone: "muted" as const };
    }
    if (codeCheckError) {
      return { text: codeCheckError, tone: "error" as const };
    }
    if (codeInfo) {
      if (!codeInfo.valid) {
        return {
          text: "Use apenas letras, números e hífens.",
          tone: "error" as const,
        };
      }
      if (codeInfo.available) {
        return {
          text: `Código disponível: ${codeInfo.slug}`,
          tone: "success" as const,
        };
      }
      return {
        text: `Código indisponível (${codeInfo.slug}).`,
        tone: "error" as const,
      };
    }
    return null;
  })();

  return (
    <AuthCard
      title="Cadastrar clube"
      description="Gerencie quadras, alunos e reservas do seu clube."
      backLink={{ href: "/", label: "Voltar" }}
      hasHeader={false}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="club-name">Nome do clube</Label>
          <Input
            id="club-name"
            name="clubName"
            placeholder="Tênis Clube Ace"
            required
            value={form.clubName}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="club-code">Código do clube</Label>
          <Input
            id="club-code"
            name="clubCode"
            placeholder="ace-tenis"
            required
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={form.clubCode}
            onChange={handleChange}
          />
          {codeHelper ? (
            <p
              className={cn("mt-1 text-xs", {
                "text-muted-foreground": codeHelper.tone === "muted",
                "text-destructive": codeHelper.tone === "error",
                "text-emerald-600 dark:text-emerald-400":
                  codeHelper.tone === "success",
              })}
            >
              {codeHelper.text}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="admin-email">Email corporativo</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            placeholder="admin@acebook.club"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="admin-password">Senha</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            placeholder="********"
            required
            value={form.password}
            onChange={handleChange}
          />
          <p className="mt-1 text-xs text-muted-foreground">{PASSWORD_HINT}</p>
        </div>
        <div>
          <Label htmlFor="admin-password-confirm">Confirmar senha</Label>
          <Input
            id="admin-password-confirm"
            name="confirmPassword"
            type="password"
            placeholder="********"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Cadastrando..." : "Criar conta do clube"}
        </Button>
      </form>
    </AuthCard>
  );
}
