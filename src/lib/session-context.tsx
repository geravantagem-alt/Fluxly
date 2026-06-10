"use client";

import { createContext, useContext } from "react";

import type { User } from "@/types";

const SessionContext = createContext<User | null>(null);

export function SessionProvider({ children, user }: { children: React.ReactNode; user: User }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSessionUser() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSessionUser must be used within SessionProvider");
  return context;
}