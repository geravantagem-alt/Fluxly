"use client";

import { useState } from "react";

import { Button, Input } from "@/components/ui";

interface EtapaFormProps {
  initialTitle?: string;
  initialDescription?: string;
  onCancel: () => void;
  onSubmit: (payload: { title: string; description: string }) => void;
}

export function EtapaForm({ initialTitle = "", initialDescription = "", onCancel, onSubmit }: EtapaFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ title, description }); }}>
      <Input onChange={(event) => setTitle(event.target.value)} placeholder="Titulo da etapa" value={title} />
      <textarea className="h-24 w-full rounded-lg border border-flux-border bg-flux-sidebar px-3 py-2 text-sm" onChange={(event) => setDescription(event.target.value)} placeholder="Descricao (opcional)" value={description} />
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}