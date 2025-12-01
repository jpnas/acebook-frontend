import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-emerald-50 to-white">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-2">
        <Card className="border-none bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <div className="hidden flex-col justify-between rounded-[32px] border bg-gradient-to-br from-primary to-emerald-600 p-8 text-primary-foreground lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.3em]">AceBook</p>
            <p className="mt-4 text-3xl font-semibold">Experiência premium para clubes e academias.</p>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Multiusuário, com perfis separados para atletas e administradores, mantendo o cadastro de coaches
              diretamente no painel, seguindo o mesmo domínio de quadras de tênis usado no primeiro trabalho.
            </p>
          </div>
          <div className="space-y-4 text-sm">
            <p>· Fluxos completos de CRUD para quadras e reservas.</p>
            <p>· Gerência de senha com esqueci/troca.</p>
            <p>
              · Documentação Swagger e endpoints protegidos no backend. Veja detalhes em{" "}
              <Link href="/" className="underline">
                AceBook.app
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
