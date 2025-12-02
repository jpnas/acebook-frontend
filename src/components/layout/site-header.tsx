import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { marketingNav } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Acebook" width={32} height={32} />
          <span className="font-semibold uppercase text-xl text-primary">
            Acebook
          </span>
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
            href="/"
            className="text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            Entrar
          </Link>
          <Link
            href="/register/player"
            className={buttonVariants({ size: "sm" })}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
