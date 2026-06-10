"use client";

import "reactflow/dist/style.css";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, type Edge, type Node } from "reactflow";

import { EtapaForm } from "@/components/forms/etapa-form";
import { Button, Card, Modal, useToast } from "@/components/ui";
import { useSessionUser } from "@/lib/session-context";
import { createEtapa, deleteEtapaAndReorder, fetchEtapasByProcesso, fetchProcessAccess, reorderEtapas, updateEtapa } from "@/lib/supabase/database";
import type { Etapa } from "@/types";

interface FlowEditorProps {
  processId: string;
  processName: string;
}

export function FlowEditor({ processId, processName }: FlowEditorProps) {
  const user = useSessionUser();
  const { push } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(user.role === "owner");
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, access] = await Promise.all([fetchEtapasByProcesso(processId), fetchProcessAccess(processId)]);
        if (!data) {
          setEtapas([]);
          return;
        }

        setCanEdit(Boolean(access?.canEdit || access?.role === "dono" || user.role === "owner"));
        setEtapas(
          data.map((item) => ({
            id: item.id,
            processId: item.processo_id,
            order: item.ordem,
            title: item.titulo,
            description: item.descricao ?? ""
          }))
        );
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Erro desconhecido.";
        push({ title: "Falha ao carregar etapas", description: message, variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [processId, push, user.role]);

  const readOnly = !canEdit;

  const sorted = useMemo(() => [...etapas].sort((a, b) => a.order - b.order), [etapas]);

  function mapDbEtapasToState(data: Array<{ id: string; processo_id: string; ordem: number; titulo: string; descricao: string | null }>) {
    return data.map((item) => ({
      id: item.id,
      processId: item.processo_id,
      order: item.ordem,
      title: item.titulo,
      description: item.descricao ?? ""
    }));
  }

  const graph = useMemo(() => {
    const nodes: Node[] = sorted.map((etapa, index) => ({
      id: etapa.id,
      position: { x: 220, y: index * 145 },
      data: {
        label: (
          <div className="relative w-72 rounded-xl border border-flux-border bg-flux-surface px-4 py-3 text-left transition-all hover:border-flux-primary/60">
            <div className="mb-1 text-[11px] uppercase tracking-wider text-flux-primary">Etapa {String(etapa.order).padStart(2, "0")}</div>
            <p className="text-sm font-semibold text-flux-text">{etapa.title}</p>
            <p className="mt-1 text-xs text-flux-muted">{etapa.description || "Sem descricao"}</p>
          </div>
        )
      },
      type: "default"
    }));

    const edges: Edge[] = sorted.slice(1).map((item, index) => ({
      id: `edge-${item.id}`,
      source: sorted[index].id,
      target: item.id,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#2a2a2a", strokeWidth: 1.5 }
    }));

    return { nodes, edges };
  }, [sorted]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-flux-border bg-flux-surface/50 px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-flux-muted">Processo atual</p>
        <h2 className="text-xl font-bold text-flux-primary">{processName}</h2>
      </div>

      <div className="grid h-[calc(100vh-245px)] grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-flux-border bg-flux-surface-alt/30 p-4">
            <h3 className="font-semibold">Etapas do Processo</h3>
            {!readOnly ? (
              <Button onClick={() => setCreateOpen(true)} size="sm">
                <Plus className="mr-1 h-4 w-4" /> Nova Etapa
              </Button>
            ) : null}
          </div>
          <div className="space-y-2 overflow-auto p-3">
            {loading ? <p className="text-sm text-flux-muted">Carregando etapas...</p> : null}
            {!loading && sorted.length === 0 ? <p className="text-sm text-flux-muted">Nenhuma etapa cadastrada.</p> : null}
            {sorted.map((etapa) => (
              <motion.div animate={{ opacity: 1, y: 0 }} className="group rounded-lg border border-flux-border bg-flux-surface-alt p-3 hover:border-flux-primary/50" initial={{ opacity: 0, y: 6 }} key={etapa.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{String(etapa.order).padStart(2, "0")}. {etapa.title}</p>
                  {!readOnly ? (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        className="rounded-md p-1 text-flux-muted hover:text-flux-primary"
                        onClick={() => {
                          setEditingEtapa(etapa);
                          setEditOpen(true);
                        }}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-flux-muted hover:text-flux-primary disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={etapa.order === 1 || saving}
                        onClick={async () => {
                          const currentIndex = sorted.findIndex((item) => item.id === etapa.id);
                          if (currentIndex <= 0) return;

                          const reordered = [...sorted];
                          [reordered[currentIndex - 1], reordered[currentIndex]] = [reordered[currentIndex], reordered[currentIndex - 1]];

                          setSaving(true);
                          try {
                            const updated = await reorderEtapas({
                              processoId: processId,
                              orderedEtapaIds: reordered.map((item) => item.id)
                            });
                            if (updated) {
                              setEtapas(mapDbEtapasToState(updated));
                              push({ title: "Etapa reordenada", variant: "success" });
                            }
                          } catch (error) {
                            console.error(error);
                            const message = error instanceof Error ? error.message : "Erro desconhecido.";
                            push({ title: "Falha ao reordenar etapa", description: message, variant: "error" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        type="button"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-flux-muted hover:text-flux-primary disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={etapa.order === sorted.length || saving}
                        onClick={async () => {
                          const currentIndex = sorted.findIndex((item) => item.id === etapa.id);
                          if (currentIndex === -1 || currentIndex >= sorted.length - 1) return;

                          const reordered = [...sorted];
                          [reordered[currentIndex], reordered[currentIndex + 1]] = [reordered[currentIndex + 1], reordered[currentIndex]];

                          setSaving(true);
                          try {
                            const updated = await reorderEtapas({
                              processoId: processId,
                              orderedEtapaIds: reordered.map((item) => item.id)
                            });
                            if (updated) {
                              setEtapas(mapDbEtapasToState(updated));
                              push({ title: "Etapa reordenada", variant: "success" });
                            }
                          } catch (error) {
                            console.error(error);
                            const message = error instanceof Error ? error.message : "Erro desconhecido.";
                            push({ title: "Falha ao reordenar etapa", description: message, variant: "error" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        type="button"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md p-1 text-flux-muted hover:text-flux-danger"
                        onClick={async () => {
                          if (!window.confirm(`Deseja excluir a etapa "${etapa.title}"?`)) {
                            return;
                          }

                          try {
                            const updated = await deleteEtapaAndReorder({ etapaId: etapa.id, processoId: processId });
                            if (updated) {
                              setEtapas(mapDbEtapasToState(updated));
                            }
                            push({ title: "Etapa removida", variant: "success" });
                          } catch (error) {
                            console.error(error);
                            const message = error instanceof Error ? error.message : "Erro desconhecido.";
                            push({ title: "Falha ao remover etapa", description: message, variant: "error" });
                          }
                        }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-flux-muted">{etapa.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="flux-grid h-full overflow-hidden">
          <ReactFlow edges={graph.edges} fitView nodes={graph.nodes} panOnDrag proOptions={{ hideAttribution: true }} zoomOnScroll>
            <Background color="#2a2a2a" gap={24} />
          </ReactFlow>
        </Card>

        <Modal description="Defina titulo e descricao para etapa." onOpenChange={setCreateOpen} open={createOpen} title="Nova Etapa">
          <EtapaForm
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (payload) => {
              if (!payload.title.trim()) {
                push({ title: "Titulo obrigatorio", variant: "error" });
                return;
              }

              const nextOrder = sorted.length ? Math.max(...sorted.map((item) => item.order)) + 1 : 1;

              setSaving(true);
              try {
                const nova = await createEtapa({
                  processoId: processId,
                  titulo: payload.title.trim(),
                  descricao: payload.description.trim(),
                  ordem: nextOrder
                });
                if (!nova) return;

                setEtapas((prev) => [
                  ...prev,
                  {
                    id: nova.id,
                    processId: nova.processo_id,
                    order: nova.ordem,
                    title: nova.titulo,
                    description: nova.descricao ?? ""
                  }
                ]);
                push({ title: "Etapa adicionada", variant: "success" });
                setCreateOpen(false);
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Erro desconhecido.";
                push({ title: "Falha ao adicionar etapa", description: message, variant: "error" });
              } finally {
                setSaving(false);
              }
            }}
          />
        </Modal>

        <Modal description="Atualize o conteudo da etapa selecionada." onOpenChange={setEditOpen} open={editOpen} title="Editar Etapa">
          <EtapaForm
            initialDescription={editingEtapa?.description ?? ""}
            initialTitle={editingEtapa?.title ?? ""}
            onCancel={() => {
              setEditOpen(false);
              setEditingEtapa(null);
            }}
            onSubmit={async (payload) => {
              if (!editingEtapa) return;
              if (!payload.title.trim()) {
                push({ title: "Titulo obrigatorio", variant: "error" });
                return;
              }

              setSaving(true);
              try {
                const updated = await updateEtapa({
                  etapaId: editingEtapa.id,
                  titulo: payload.title.trim(),
                  descricao: payload.description.trim()
                });

                if (updated) {
                  setEtapas((prev) =>
                    prev.map((item) =>
                      item.id === editingEtapa.id
                        ? {
                            ...item,
                            title: updated.titulo,
                            description: updated.descricao ?? ""
                          }
                        : item
                    )
                  );
                }

                push({ title: "Etapa atualizada", variant: "success" });
                setEditOpen(false);
                setEditingEtapa(null);
              } catch (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : "Erro desconhecido.";
                push({ title: "Falha ao atualizar etapa", description: message, variant: "error" });
              } finally {
                setSaving(false);
              }
            }}
          />
        </Modal>
      </div>
    </section>
  );
}
