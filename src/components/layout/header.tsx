"use client";

import { ArrowLeft, Bell, Search } from "lucide-react";

import { Avatar, Button, Input } from "@/components/ui";
import type { User } from "@/types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: User;
  action?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, subtitle, user, action, showBack, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-flux-border bg-flux-bg/85 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {showBack ? (
            <Button className="mb-2 px-2" onClick={onBack} size="sm" variant="ghost">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
          ) : null}
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-flux-muted">{subtitle}</p> : null}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-flux-muted" />
            <Input aria-label="Pesquisar" className="pl-9" placeholder="Pesquisar" />
          </div>
          {action}
          <button aria-label="Notificacoes" className="rounded-lg border border-flux-border bg-flux-surface p-2 text-flux-muted hover:text-flux-text">
            <Bell className="h-4 w-4" />
          </button>
          <Avatar initials={user.name.slice(0, 2).toUpperCase()} />
        </div>
      </div>
    </header>
  );
}