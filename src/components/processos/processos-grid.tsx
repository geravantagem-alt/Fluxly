"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProcessoForm } from "@/components/forms/processo-form";
import { Badge, Button, Card, Modal, useToast } from "@/components/ui";
import { useSessionUser } from "@/lib/session-context";
import {
  createProcesso,
  deleteProcesso,
  fetchCompanyCollaborators,
  fetchProcessoCollaboratorMap,
  fetchProcessosByArea,
  replaceProcessoCollaborators,
  updateProcesso
} from "@/lib/supabase/database";
import type { User } from "@/types";

interface ProcessoCard {
  id: string;
  areaId: string;
  name: string;
  updatedAt: string;
  assignedUserIds: string[];
}

interface ProcessosGridProps {
  areaId: string;
}

export function ProcessosGrid({ areaId }: ProcessosGridProps) {
  const user = useSessionUser();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processos, setProcessos] = useState<ProcessoCard[]>([]);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [editingProcesso, setEditingProcesso] = useState<ProcessoCard | null>(null);
  const ownerMode = user.role === "owner";

  const current = useMemo(() => processos.filter((item) => item.areaId === areaId), [areaId, processos]);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, collaboratorRows, processCollaboratorMap] = await Promise.all([
          fetchProcessosByArea(areaId),
          fetchCompanyCollaborators(),
          fetchProcessoCollaboratorMap(areaId)
        ]);
        if (!data) {
          setProcessos([]);
          return;
        }

        setCollaborators(
          (collaboratorRows ?? []).map((item) => ({
            id: item.id,
            email: item.email,
            name: item.nome_completo,
            role: "collaborator"
          }))
        );

        setProcessos(
          data.map((item) => ({
            id: item.id,
            areaId: item.area_id,
            name: item.nome,
            updatedAt: new Date(item.criado_em).toLocaleDateString("pt-BR"),
            assignedUserIds: processCollaboratorMap?.get(item.id) ?? []
          }))
        );
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Erro desconhecido.";
        push({ title: "Falha ao carregar processos", description: message, variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [areaId, push]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Processos da area</h2>
          <p className="text-sm text-flux-muted">Clique em um processo para abrir o fluxograma.</p>
        </div>
        {ownerMode ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Processo
          </Button>
        ) : null}
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold">Carregando processos...</p>
        </Card>
      ) : current.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold">Nenhum processo nesta area</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {current.map((processo) => (
            <Card className="p-5" key={processo.id}>
              <div className="mb-4 flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">{processo.name}</h3>
                  <Badge>Atualizado {processo.updatedAt}</Badge>
                </div>
                {ownerMode ? (
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-md p-2 text-flux-muted hover:bg-flux-surface-alt hover:text-flux-primary"
                      onClick={() => {
                        setEditingProcesso(processo);
                        setEditOpen(true);
                      }}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-flux-muted hover:bg-flux-danger/10 hover:text-flux-danger"
                      onClick={async () => {
                        if (!window.confirm(`Deseja excluir o processo "${processo.name}"?`)) {
                          return;
                        }

                        try {
                          await deleteProcesso(processo.id);
                          setProcessos((prev) => prev.filter((item) => item.id !== processo.id));
                          push({ title: "Processo removido", variant: "success" });
                        } catch (error) {
                          console.error(error);
                          const message = error instanceof Error ? error.message : "Erro desconhecido.";
                          push({ title: "Falha ao remover processo", description: message, variant: "error" });
                        }
                      }}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {processo.assignedUserIds.length === 0 ? <span className="text-xs text-flux-muted">Sem colaboradores atribuidos</span> : null}
                {processo.assignedUserIds.map((id) => {
                  const user = collaborators.find((item) => item.id === id);
                  return <Badge key={id}>{user?.name ?? "Colaborador"}</Badge>;
                })}
              </div>
              <Link className="text-sm font-semibold text-flux-primary" href={`/areas/${areaId}/processos/${processo.id}`}>
                Abrir fluxograma
              </Link>
            </Card>
          ))}
        </div>
      )}

      {ownerMode ? (
        <Modal description="Nomeie o processo e depois detalhe as etapas." onOpenChange={setOpen} open={open} title="Novo Processo">
          <ProcessoForm
            collaboratorOptions={collaborators}
            onCancel={() => setOpen(false)}
            submitLabel={saving ? "Salvando..." : "Salvar"}
            onSubmit={async ({ name, assignedUserIds }) => {
            if (!name.trim()) {
              push({ title: "Nome obrigatorio", variant: "error" });
              return;
            }
            setSaving(true);
            try {
              const novo = await createProcesso({ areaId, nome: name.trim() });
              if (!novo) return;
                await replaceProcessoCollaborators(novo.id, assignedUserIds);

                setProcessos((prev) => [
                  {
                    id: novo.id,
                    areaId: novo.area_id,
                    name: novo.nome,
                    updatedAt: new Date(novo.criado_em).toLocaleDateString("pt-BR"),
                    assignedUserIds
                  },
                  ...prev
              ]);
              push({ title: "Processo criado", variant: "success" });
              setOpen(false);
            } catch (error) {
              console.error(error);
              const message = error instanceof Error ? error.message : "Erro desconhecido.";
              push({ title: "Falha ao criar processo", description: message, variant: "error" });
            } finally {
              setSaving(false);
            }
          }}
        />
      </Modal>
      ) : null}

      {ownerMode ? (
        <Modal description="Atualize o nome e os colaboradores do processo." onOpenChange={setEditOpen} open={editOpen} title="Editar Processo">
          <ProcessoForm
            collaboratorOptions={collaborators}
            initialAssignedUserIds={editingProcesso?.assignedUserIds ?? []}
            initialName={editingProcesso?.name ?? ""}
            onCancel={() => {
              setEditOpen(false);
              setEditingProcesso(null);
            }}
            onSubmit={async ({ name, assignedUserIds }) => {
              if (!editingProcesso) return;
              if (!name.trim()) {
                push({ title: "Nome obrigatorio", variant: "error" });
                return;
              }

              setSaving(true);
              try {
                const updated = await updateProcesso({
                  processoId: editingProcesso.id,
                  nome: name.trim()
                });
                if (!updated) return;

                await replaceProcessoCollaborators(editingProcesso.id, assignedUserIds);

                setProcessos((prev) =>
                  prev.map((item) =>
                    item.id === editingProcesso.id
                      ? {
                          ...item,
                          name: updated.nome,
                          assignedUserIds,
                          updatedAt: new Date(updated.criado_em).toLocaleDateString("pt-BR")
                        }
                      : item
                  )
                );
                push({ title: "Processo atualizado", variant: "success" });
                setEditOpen(false);
                setEditingProcesso(null);
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Erro desconhecido.";
                push({ title: "Falha ao atualizar processo", description: message, variant: "error" });
              } finally {
                setSaving(false);
              }
            }}
            submitLabel={saving ? "Salvando..." : "Salvar alteracoes"}
          />
        </Modal>
      ) : null}
    </section>
  );
}
