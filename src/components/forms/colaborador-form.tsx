"use client";

import { useState } from "react";

import { Badge, Button, Input } from "@/components/ui";

interface AreaOption {
  id: string;
  nome: string;
}

interface ProcessOption {
  id: string;
  nome: string;
  areaId: string;
  areaNome: string;
}

interface ColaboradorFormProps {
  initialName?: string;
  initialEmail?: string;
  initialAreaIds?: string[];
  initialProcessIds?: string[];
  showPassword?: boolean;
  areaOptions: AreaOption[];
  processOptions: ProcessOption[];
  onCancel: () => void;
  onSubmit: (payload: { name: string; email: string; password: string; areaIds: string[]; processIds: string[] }) => void;
}

export function ColaboradorForm({
  initialName = "",
  initialEmail = "",
  initialAreaIds = [],
  initialProcessIds = [],
  showPassword = true,
  areaOptions,
  processOptions,
  onCancel,
  onSubmit
}: ColaboradorFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(initialAreaIds);
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>(initialProcessIds);

  const toggleArea = (id: string) => {
    setSelectedAreaIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleProcess = (id: string) => {
    setSelectedProcessIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ name, email, password, areaIds: selectedAreaIds, processIds: selectedProcessIds });
      }}
    >
      <Input onChange={(event) => setName(event.target.value)} placeholder="Nome completo" value={name} />
      <Input onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
      {showPassword ? <Input onChange={(event) => setPassword(event.target.value)} placeholder="Senha temporaria" type="password" value={password} /> : null}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-flux-muted">Atribuir a areas</p>
        <div className="max-h-36 space-y-2 overflow-auto rounded-lg border border-flux-border bg-flux-sidebar p-2">
          {areaOptions.map((area) => (
            <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-flux-surface" key={area.id}>
              <span>{area.nome}</span>
              <input checked={selectedAreaIds.includes(area.id)} onChange={() => toggleArea(area.id)} type="checkbox" />
            </label>
          ))}
        </div>
        {selectedAreaIds.length ? (
          <div className="flex flex-wrap gap-1">
            {selectedAreaIds.map((id) => {
              const area = areaOptions.find((item) => item.id === id);
              return <Badge key={id}>{area?.nome ?? "Area"}</Badge>;
            })}
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-flux-muted">Atribuir a processos especificos</p>
        <div className="max-h-44 space-y-2 overflow-auto rounded-lg border border-flux-border bg-flux-sidebar p-2">
          {processOptions.map((processo) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 text-sm hover:bg-flux-surface" key={processo.id}>
              <div>
                <span className="block">{processo.nome}</span>
                <span className="text-xs text-flux-muted">{processo.areaNome}</span>
              </div>
              <input checked={selectedProcessIds.includes(processo.id)} onChange={() => toggleProcess(processo.id)} type="checkbox" />
            </label>
          ))}
        </div>
        {selectedProcessIds.length ? (
          <div className="flex flex-wrap gap-1">
            {selectedProcessIds.map((id) => {
              const processo = processOptions.find((item) => item.id === id);
              return <Badge key={id}>{processo ? `${processo.areaNome} - ${processo.nome}` : "Processo"}</Badge>;
            })}
          </div>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
