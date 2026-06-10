"use client";

import { AuthSync } from "@/components/auth/auth-sync";
import { ToastProvider } from "@/components/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthSync />
      {children}
    </ToastProvider>
  );
}
