"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getSidebarItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getSidebarItems(role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-flux-border bg-flux-sidebar/95 px-2 py-2 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-[11px] font-medium",
              active ? "bg-flux-surface text-flux-primary" : "text-flux-muted"
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
  );
}
