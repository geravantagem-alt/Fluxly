"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "@/lib/session-context";
import type { User } from "@/types";

function getTitle(pathname: string) {
  if (pathname.startsWith("/areas/") && pathname.includes("/processos/")) return "Fluxograma";
  if (pathname.startsWith("/areas/")) return "Processos";
  if (pathname === "/colaboradores") return "Colaboradores";
  if (pathname === "/configuracoes") return "Configuracoes";
  return "Areas";
}

export function DashboardShell({ children, user }: { children: React.ReactNode; user: User }) {
  const router = useRouter();
  const pathname = usePathname();

  const title = useMemo(() => getTitle(pathname), [pathname]);
  const showBack = pathname !== "/dashboard";

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-screen bg-flux-bg">
        <Sidebar user={user} />
        <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
          <Header
            onBack={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/dashboard");
            }}
            showBack={showBack}
            subtitle="Fluxly workspace"
            title={title}
            user={user}
          />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          <Footer />
        </div>
        <MobileNav role={user.role} />
      </div>
    </SessionProvider>
  );
}
