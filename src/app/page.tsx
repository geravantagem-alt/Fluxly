import Link from "next/link";

import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-flux-border bg-flux-surface p-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-flux-muted">Fluxly</p>
        <h1 className="mb-3 text-4xl font-black">Mapeie seus processos</h1>
        <p className="mx-auto mb-7 max-w-xl text-sm text-flux-muted">
          Centralize areas, processos e fluxogramas da sua empresa em um workspace visual com acesso por perfil.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Criar conta</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
