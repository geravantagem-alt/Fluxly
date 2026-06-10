"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

import { Button, Input, useToast } from "@/components/ui";
import { loginWithCredentials } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const result = await loginWithCredentials({ email, password });

    if (!result.ok) {
      push({ title: "Falha no login", description: result.message, variant: "error" });
      setLoading(false);
      return;
    }

    push({ title: "Login realizado", description: "Redirecionando para areas.", variant: "success" });
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <motion.form animate={{ opacity: 1, y: 0 }} className="space-y-4" initial={{ opacity: 0, y: 8 }} onSubmit={submit}>
      <div className="grid gap-2">
        <label className="text-sm text-flux-muted" htmlFor="email">Email</label>
        <Input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-flux-muted" htmlFor="senha">Senha</label>
        <Input autoComplete="current-password" id="senha" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
      </div>
      <Button className="w-full" disabled={loading} type="submit">{loading ? "Entrando..." : "Entrar"}</Button>
      <p className="text-center text-xs text-flux-muted">
        Nao tem conta? <Link className="text-flux-primary" href="/signup">Criar conta</Link>
      </p>
    </motion.form>
  );
}
