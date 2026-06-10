"use client";

import { useState } from "react";

import { Badge, Button, Input } from "@/components/ui";
import type { User } from "@/types";

interface ProcessoFormSubmit {
  name: string;
  assignedUserIds: string[];
}

interface ProcessoFormProps {
  initialName?: string;
  initialAssignedUserIds?: string[];
  collaboratorOptions: User[];
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: ProcessoFormSubmit) => void;
}

export function ProcessoForm({
  initialName = "",
  initialAssignedUserIds = [],
  collaboratorOptions,
  submitLabel = "Salvar",
  onCancel,
  onSubmit
}: ProcessoFormProps) {
  const [name, setName] = useState(initialName);
  const [selected, setSelected] = useState<string[]>(initialAssignedUserIds);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ name, assignedUserIds: selected });
      }}
    >
      <Input onChange={(event) => setName(event.target.value)} placeholder="Nome do processo" value={name} />

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-flux-muted">Atribuir colaboradores</p>
        <div className="max-h-36 space-y-2 overflow-auto rounded-lg border border-flux-border bg-flux-sidebar p-2">
          {collaboratorOptions.map((user) => (
            <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-flux-surface" key={user.id}>
              <span>{user.name}</span>
              <input checked={selected.includes(user.id)} onChange={() => toggle(user.id)} type="checkbox" />
            </label>
          ))}
        </div>
        {selected.length ? (
          <div className="flex flex-wrap gap-1">
            {selected.map((id) => {
              const user = collaboratorOptions.find((item) => item.id === id);
              return <Badge key={id}>{user?.name ?? "Colaborador"}</Badge>;
            })}
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
