"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";

import type { ToastVariant } from "@/types";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function getIcon(variant: ToastVariant) {
  if (variant === "success") return <CheckCircle2 className="h-4 w-4 text-flux-success" />;
  if (variant === "error") return <CircleAlert className="h-4 w-4 text-flux-danger" />;
  return <Info className="h-4 w-4 text-flux-primary" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      push: (message) => {
        const id = crypto.randomUUID();
        setMessages((prev) => [...prev, { ...message, id }]);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map((message) => (
          <ToastPrimitive.Root
            className="mb-2 flex w-[340px] items-start gap-3 rounded-lg border border-flux-border bg-flux-surface p-3 shadow-card"
            duration={2200}
            key={message.id}
            onOpenChange={(open) => {
              if (!open) setMessages((prev) => prev.filter((item) => item.id !== message.id));
            }}
            open
          >
            {getIcon(message.variant)}
            <div>
              <ToastPrimitive.Title className="text-sm font-semibold">{message.title}</ToastPrimitive.Title>
              {message.description ? <ToastPrimitive.Description className="text-xs text-flux-muted">{message.description}</ToastPrimitive.Description> : null}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}