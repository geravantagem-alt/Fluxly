"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

import { Button, Input, useToast } from "@/components/ui";
import { createOwnerAndLogin } from "@/lib/auth-client";
import { isValidCnpjFormat, maskCnpj } from "@/lib/cnpj";

export function SignupForm() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    cnpj: ""
  });

  const onChange = (field: keyof typeof form, value: string) => {
    if (field === "cnpj") {
      setForm((prev) => ({ ...prev, cnpj: maskCnpj(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password || !form.company || !form.cnpj) {
      push({ title: "Campos obrigatorios", description: "Preencha todos os campos.", variant: "error" });
      return;
    }

    if (!isValidCnpjFormat(form.cnpj)) {
      push({ title: "Formato de CNPJ invalido", description: "Use o formato 11.111.111/0001-11.", variant: "error" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      push({ title: "Senhas diferentes", description: "As senhas nao coincidem.", variant: "error" });
      return;
    }

    setLoading(true);

    const result = await createOwnerAndLogin({
      name: form.name,
      email: form.email,
      password: form.password,
      companyName: form.company,
      cnpj: form.cnpj
    });

    if (!result.ok) {
      push({ title: "Falha no cadastro", description: result.message, variant: "error" });
      setLoading(false);
      return;
    }

    if ("pendingConfirmation" in result && result.pendingConfirmation) {
      push({ title: "Conta criada", description: result.message, variant: "info" });
      router.push("/login");
      setLoading(false);
      return;
    }

    push({ title: "Conta criada", description: "Login realizado com sucesso.", variant: "success" });
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <motion.form animate={{ opacity: 1, y: 0 }} className="space-y-3" initial={{ opacity: 0, y: 8 }} onSubmit={submit}>
      <Input onChange={(event) => onChange("name", event.target.value)} placeholder="Nome completo" value={form.name} />
      <Input onChange={(event) => onChange("email", event.target.value)} placeholder="Email" type="email" value={form.email} />
      <Input onChange={(event) => onChange("password", event.target.value)} placeholder="Senha" type="password" value={form.password} />
      <Input onChange={(event) => onChange("confirmPassword", event.target.value)} placeholder="Confirmar senha" type="password" value={form.confirmPassword} />
      <Input onChange={(event) => onChange("company", event.target.value)} placeholder="Nome da empresa" value={form.company} />
      <Input maxLength={18} onChange={(event) => onChange("cnpj", event.target.value)} placeholder="11.111.111/0001-11" value={form.cnpj} />
      <Button className="w-full" disabled={loading} type="submit">{loading ? "Criando..." : "Criar conta"}</Button>
      <p className="text-center text-xs text-flux-muted">
        Ja tem conta? <Link className="text-flux-primary" href="/login">Entrar</Link>
      </p>
    </motion.form>
  );
}