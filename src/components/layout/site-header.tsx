import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { marketingNav } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="font-semibold text-xl text-primary">
          AceBook
        </Link>
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            Entrar
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
