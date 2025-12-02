import Link from "next/link";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ArrowLeft, Eclipse } from "lucide-react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  backLink?: {
    href: string;
    label?: string;
  };
  hasHeader?: boolean;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  backLink,
  hasHeader = true,
}: AuthCardProps) {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-2xl">
        {backLink ? (
          <div className="flex justify-start px-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="px-0 text-sm font-medium"
            >
              <Link href={backLink.href} className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                {backLink.label ?? "Voltar"}
              </Link>
            </Button>
          </div>
        ) : null}
        {hasHeader ? (
          <div className="flex items-center justify-center border-border/50 px-6 py-4">
            <Eclipse className="size-5" />
            <p className="text-md font-semibold uppercase tracking-[0.3em] ml-3">
              AceBook
            </p>
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer ? (
          <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
