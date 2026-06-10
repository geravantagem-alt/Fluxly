"use client";

import { useEffect, useState } from "react";

import { Button, Input, useToast } from "@/components/ui";
import {
  ensureSessionFromSupabase,
  fetchCurrentSettings,
  updateCurrentCompany,
  updateCurrentPassword,
  updateCurrentProfileName
} from "@/lib/auth-client";
import { isValidCnpjFormat, maskCnpj } from "@/lib/cnpj";
import type { User } from "@/types";

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { push } = useToast();
  const ownerMode = user.role === "owner";

  const [name, setName] = useState(user.name);
  const [companyName, setCompanyName] = useState("Fluxly Solucoes Digitais");
  const [cnpj, setCnpj] = useState("00.000.000/0001-00");
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        await ensureSessionFromSupabase();
        const settings = await fetchCurrentSettings();
        if (!settings) return;

        if (settings.nomeCompleto) setName(settings.nomeCompleto);
        if (settings.empresa) {
          setCompanyName(settings.empresa.nome);
          setCnpj(maskCnpj(settings.empresa.cnpj));
        }
      } catch (error) {
        console.error(error);
        push({ title: "Falha ao carregar configuracoes", variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [push]);

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-flux-border bg-flux-surface p-5">
        <h3 className="mb-4 text-lg font-semibold">Meus dados</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input onChange={(event) => setName(event.target.value)} placeholder="Nome" value={name} />
          <Input placeholder="Email" readOnly type="email" value={user.email} />

          <Input className="md:col-span-2" onChange={(event) => setNewPassword(event.target.value)} placeholder="Nova senha" type="password" value={newPassword} />
          <Input
            className="md:col-span-2"
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            placeholder="Confirmar nova senha"
            type="password"
            value={confirmNewPassword}
          />
        </div>
        <Button
          className="mt-4"
          disabled={loading || savingPersonal}
          onClick={async () => {
            if (!name.trim()) {
              push({ title: "Nome obrigatorio", variant: "error" });
              return;
            }

            if (newPassword || confirmNewPassword) {
              if (newPassword.length < 6) {
                push({ title: "Nova senha muito curta", variant: "error" });
                return;
              }
              if (newPassword !== confirmNewPassword) {
                push({ title: "As senhas nao coincidem", variant: "error" });
                return;
              }
            }

            setSavingPersonal(true);
            try {
              await updateCurrentProfileName(name);
              if (newPassword) {
                await updateCurrentPassword(newPassword);
              }
              push({ title: "Dados pessoais atualizados", variant: "success" });
              setNewPassword("");
              setConfirmNewPassword("");
            } catch (error) {
              console.error(error);
              const message = error instanceof Error ? error.message : "Falha ao salvar dados pessoais.";
              push({ title: "Erro ao salvar", description: message, variant: "error" });
            } finally {
              setSavingPersonal(false);
            }
          }}
          type="button"
        >
          {savingPersonal ? "Salvando..." : "Salvar dados pessoais"}
        </Button>
      </section>

      {ownerMode ? (
        <section className="rounded-xl border border-flux-border bg-flux-surface p-5">
          <h3 className="mb-4 text-lg font-semibold">Dados da empresa</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Input onChange={(event) => setCompanyName(event.target.value)} placeholder="Nome da empresa" value={companyName} />
            <Input
              maxLength={18}
              onChange={(event) => setCnpj(maskCnpj(event.target.value))}
              placeholder="11.111.111/0001-11"
              value={cnpj}
            />
          </div>
          <Button
            className="mt-4"
            disabled={loading || savingCompany}
            onClick={async () => {
              if (!companyName.trim()) {
                push({ title: "Nome da empresa obrigatorio", variant: "error" });
                return;
              }

              if (!isValidCnpjFormat(cnpj)) {
                push({ title: "Formato de CNPJ invalido", description: "Use 11.111.111/0001-11.", variant: "error" });
                return;
              }

              setSavingCompany(true);
              try {
                await updateCurrentCompany({ name: companyName, cnpj });
                push({ title: "Dados da empresa atualizados", variant: "success" });
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Falha ao salvar dados da empresa.";
                push({ title: "Erro ao salvar empresa", description: message, variant: "error" });
              } finally {
                setSavingCompany(false);
              }
            }}
            type="button"
          >
            {savingCompany ? "Salvando..." : "Salvar dados da empresa"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}
