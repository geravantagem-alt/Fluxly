"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ColaboradorForm } from "@/components/forms/colaborador-form";
import { Badge, Button, Card, Input, Modal, useToast } from "@/components/ui";
import {
  createCollaborator,
  deleteCollaborator,
  listCollaborators,
  updateCollaborator,
  type AreaOption,
  type CollaboratorItem,
  type ProcessOption
} from "@/lib/collaborators-client";

export function ColaboradoresTable() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CollaboratorItem | null>(null);
  const [users, setUsers] = useState<CollaboratorItem[]>([]);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [processOptions, setProcessOptions] = useState<ProcessOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCollaborators();
      setUsers(result.collaborators);
      setAreaOptions(result.areaOptions);
      setProcessOptions(result.processOptions);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Falha ao carregar colaboradores.";
      push({ title: "Erro ao carregar", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => users.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.email.toLowerCase().includes(query.toLowerCase())),
    [query, users]
  );

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-flux-muted" />
          <Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar colaborador" value={query} />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-flux-surface-alt text-xs uppercase text-flux-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Areas</th>
              <th className="px-4 py-3">Processos</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t border-flux-border">
                <td className="px-4 py-3 text-flux-muted" colSpan={5}>Carregando colaboradores...</td>
              </tr>
            ) : null}
            {!loading && filtered.length === 0 ? (
              <tr className="border-t border-flux-border">
                <td className="px-4 py-3 text-flux-muted" colSpan={5}>Nenhum colaborador encontrado.</td>
              </tr>
            ) : null}
            {filtered.map((user) => (
              <tr className="border-t border-flux-border" key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-flux-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.assignedAreaNames.length === 0 ? <span className="text-xs text-flux-muted">Sem areas</span> : null}
                    {user.assignedAreaNames.map((areaName) => <Badge key={`${user.id}-${areaName}`}>{areaName}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.assignedProcessNames.length === 0 ? <span className="text-xs text-flux-muted">Sem processos</span> : null}
                    {user.assignedProcessNames.map((processName) => <Badge key={`${user.id}-${processName}`}>{processName}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      className="rounded-md p-2 text-flux-muted hover:bg-flux-surface-alt hover:text-flux-primary"
                      onClick={() => {
                        setEditing(user);
                        setEditOpen(true);
                      }}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-flux-muted hover:bg-flux-danger/10 hover:text-flux-danger"
                      onClick={async () => {
                        try {
                          await deleteCollaborator(user.id);
                          push({ title: "Colaborador removido", variant: "success" });
                          await load();
                        } catch (error) {
                          console.error(error);
                          const message = error instanceof Error ? error.message : "Falha ao remover colaborador.";
                          push({ title: "Erro ao remover", description: message, variant: "error" });
                        }
                      }}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal description="Crie colaborador e compartilhe credenciais manualmente." onOpenChange={setCreateOpen} open={createOpen} title="Novo Colaborador">
        <ColaboradorForm
          areaOptions={areaOptions}
          processOptions={processOptions}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async ({ name, email, password, areaIds, processIds }) => {
            if (!email.trim()) {
              push({ title: "Email obrigatorio", variant: "error" });
              return;
            }
            if (!password.trim() || password.trim().length < 6) {
              push({ title: "Senha invalida", description: "Use ao menos 6 caracteres.", variant: "error" });
              return;
            }
            setSaving(true);
            try {
              await createCollaborator({ email, password, name, areaIds, processIds });
              push({ title: "Colaborador criado", variant: "success" });
              setCreateOpen(false);
              await load();
            } catch (error) {
              console.error(error);
              const message = error instanceof Error ? error.message : "Falha ao criar colaborador.";
              push({ title: "Erro ao criar", description: message, variant: "error" });
            } finally {
              setSaving(false);
            }
          }}
        />
      </Modal>

      <Modal description="Atualize os dados do colaborador." onOpenChange={setEditOpen} open={editOpen} title="Editar Colaborador">
        <ColaboradorForm
          areaOptions={areaOptions}
          initialAreaIds={editing?.assignedAreaIds ?? []}
          initialProcessIds={editing?.assignedProcessIds ?? []}
          initialName={editing?.name ?? ""}
          initialEmail={editing?.email ?? ""}
          processOptions={processOptions}
          showPassword={false}
          onCancel={() => {
            setEditOpen(false);
            setEditing(null);
          }}
          onSubmit={async ({ name, email, areaIds, processIds }) => {
            if (!editing) return;
            setSaving(true);
            try {
              await updateCollaborator(editing.id, { name, email, areaIds, processIds });
              push({ title: "Colaborador atualizado", variant: "success" });
              setEditOpen(false);
              setEditing(null);
              await load();
            } catch (error) {
              console.error(error);
              const message = error instanceof Error ? error.message : "Falha ao atualizar colaborador.";
              push({ title: "Erro ao atualizar", description: message, variant: "error" });
            } finally {
              setSaving(false);
            }
          }}
        />
      </Modal>
    </section>
  );
}
