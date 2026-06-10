"use client";

import { motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AreaForm } from "@/components/forms/area-form";
import { Badge, Button, Card, Modal, useToast } from "@/components/ui";
import { useSessionUser } from "@/lib/session-context";
import {
  countProcessosByArea,
  createArea,
  deleteArea,
  fetchAreaCollaboratorMap,
  fetchAreas,
  fetchCompanyCollaborators,
  replaceAreaCollaborators,
  updateArea
} from "@/lib/supabase/database";
import type { User } from "@/types";

interface AreaCard {
  id: string;
  name: string;
  processCount: number;
  collaboratorIds: string[];
}

export function AreasGrid() {
  const user = useSessionUser();
  const { push } = useToast();
  const [areas, setAreas] = useState<AreaCard[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [editingArea, setEditingArea] = useState<AreaCard | null>(null);
  const empty = useMemo(() => areas.length === 0, [areas.length]);
  const ownerMode = user.role === "owner";

  useEffect(() => {
    const load = async () => {
      try {
        const [areasRows, countMap, collaboratorRows, areaCollaboratorMap] = await Promise.all([
          fetchAreas(),
          countProcessosByArea(),
          fetchCompanyCollaborators(),
          fetchAreaCollaboratorMap()
        ]);
        if (!areasRows) {
          setAreas([]);
          return;
        }

        const collaboratorsMapped: User[] = (collaboratorRows ?? []).map((item) => ({
          id: item.id,
          email: item.email,
          name: item.nome_completo,
          role: "collaborator"
        }));
        setCollaborators(collaboratorsMapped);

        setAreas(
          areasRows.map((area) => ({
            id: area.id,
            name: area.nome,
            processCount: countMap?.get(area.id) ?? 0,
            collaboratorIds: areaCollaboratorMap?.get(area.id) ?? []
          }))
        );
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Erro desconhecido.";
        push({ title: "Falha ao carregar areas", description: message, variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [push]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-flux-muted">Organize setores da empresa e conecte processos.</p>
        {ownerMode ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Area
          </Button>
        ) : null}
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold">Carregando areas...</p>
        </Card>
      ) : empty ? (
        <Card className="flex min-h-56 flex-col items-center justify-center gap-2 border-dashed">
          <p className="text-lg font-semibold">Nenhuma area cadastrada.</p>
          <p className="text-sm text-flux-muted">Crie sua primeira area para iniciar.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {areas.map((area, index) => (
            <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }} key={area.id} transition={{ delay: index * 0.03 }}>
              <Card className="group p-5 transition-all hover:border-flux-primary/60 hover:shadow-glow">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{area.name}</h3>
                  <Badge>{area.processCount} processos</Badge>
                </div>
                <p className="mb-2 text-sm text-flux-muted">Setor cadastrado no workspace.</p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {area.collaboratorIds.length === 0 ? <span className="text-xs text-flux-muted">Sem colaboradores atribuidos</span> : null}
                  {area.collaboratorIds.map((id) => {
                    const user = collaborators.find((item) => item.id === id);
                    return <Badge key={id}>{user?.name ?? "Colaborador"}</Badge>;
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <Link className="text-sm font-semibold text-flux-primary" href={`/areas/${area.id}`}>
                    Abrir area
                  </Link>
                  {ownerMode ? (
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="Editar area"
                        className="rounded-md p-2 text-flux-muted hover:bg-flux-surface-alt hover:text-flux-primary"
                        onClick={() => {
                          setEditingArea(area);
                          setEditOpen(true);
                        }}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Excluir area"
                        className="rounded-md p-2 text-flux-muted hover:bg-flux-danger/10 hover:text-flux-danger"
                        onClick={async () => {
                          if (!window.confirm(`Deseja excluir a area "${area.name}"?`)) {
                            return;
                          }

                          try {
                            await deleteArea(area.id);
                            setAreas((prev) => prev.filter((item) => item.id !== area.id));
                            push({ title: "Area removida", variant: "success" });
                          } catch (error) {
                            console.error(error);
                            const message = error instanceof Error ? error.message : "Erro desconhecido.";
                            push({ title: "Falha ao remover area", description: message, variant: "error" });
                          }
                        }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {ownerMode ? (
        <Modal description="Defina o nome da nova area." onOpenChange={setOpen} open={open} title="Nova Area">
          <AreaForm
            collaboratorOptions={collaborators}
            onCancel={() => setOpen(false)}
            submitLabel={saving ? "Salvando..." : "Salvar"}
            onSubmit={async ({ name, collaboratorIds }) => {
              if (!name.trim()) {
                push({ title: "Nome obrigatorio", variant: "error" });
                return;
              }
              setSaving(true);
              try {
                const created = await createArea({ nome: name.trim() });
                if (!created) return;
                await replaceAreaCollaborators(created.id, collaboratorIds);

                setAreas((prev) => [{ id: created.id, name: created.nome, processCount: 0, collaboratorIds }, ...prev]);
                push({ title: "Area criada", variant: "success" });
                setOpen(false);
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Erro desconhecido.";
                push({ title: "Falha ao criar area", description: message, variant: "error" });
              } finally {
                setSaving(false);
              }
            }}
          />
        </Modal>
      ) : null}

      {ownerMode ? (
        <Modal description="Atualize o nome da area e seus colaboradores." onOpenChange={setEditOpen} open={editOpen} title="Editar Area">
          <AreaForm
            collaboratorOptions={collaborators}
            initialCollaboratorIds={editingArea?.collaboratorIds ?? []}
            initialName={editingArea?.name ?? ""}
            onCancel={() => {
              setEditOpen(false);
              setEditingArea(null);
            }}
            onSubmit={async ({ name, collaboratorIds }) => {
              if (!editingArea) return;
              if (!name.trim()) {
                push({ title: "Nome obrigatorio", variant: "error" });
                return;
              }

              setSaving(true);
              try {
                const updated = await updateArea({ areaId: editingArea.id, nome: name.trim() });
                if (!updated) return;

                await replaceAreaCollaborators(editingArea.id, collaboratorIds);

                setAreas((prev) =>
                  prev.map((item) =>
                    item.id === editingArea.id
                      ? {
                          ...item,
                          name: updated.nome,
                          collaboratorIds
                        }
                      : item
                  )
                );
                push({ title: "Area atualizada", variant: "success" });
                setEditOpen(false);
                setEditingArea(null);
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Erro desconhecido.";
                push({ title: "Falha ao atualizar area", description: message, variant: "error" });
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
