import { redirect } from "next/navigation";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui";
import { getServerSessionUser } from "@/lib/supabase/server";

export default async function LoginPage() {
  const user = await getServerSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="border-b border-flux-border p-2">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-flux-sidebar p-1">
            <Link className="rounded-md bg-flux-surface px-3 py-2 text-center text-sm font-semibold" href="/login">Entrar</Link>
            <Link className="rounded-md px-3 py-2 text-center text-sm text-flux-muted hover:bg-flux-surface" href="/signup">Criar conta</Link>
          </div>
        </div>
        <div className="p-6">
          <h1 className="mb-1 text-2xl font-bold">Acesse sua conta</h1>
          <p className="mb-6 text-sm text-flux-muted">Entre para gerenciar areas e processos.</p>
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
