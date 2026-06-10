"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Workflow } from "lucide-react";

import { getSidebarItems } from "@/lib/constants";
import { logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { Avatar, Button } from "@/components/ui";

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = getSidebarItems(user.role);

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-flux-border bg-flux-sidebar p-4 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flux-primary text-black">
          <Workflow className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold">Fluxly</p>
          <p className="text-xs text-flux-muted">Process Hub</p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all",
                active
                  ? "border-flux-primary/30 bg-flux-surface-alt text-flux-primary"
                  : "border-transparent text-flux-muted hover:border-flux-border hover:text-flux-text"
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-flux-border bg-flux-surface p-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar initials={user.name.slice(0, 2).toUpperCase()} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-flux-muted">{user.email}</p>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={async () => {
            await logout();
            router.push("/login");
            router.refresh();
          }}
          size="sm"
          variant="ghost"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </aside>
  );
}
