"use client";

import { SettingsPanel } from "@/components/settings/settings-panel";
import { useSessionUser } from "@/lib/session-context";

export default function ConfiguracoesPage() {
  const user = useSessionUser();
  return <SettingsPanel user={user} />;
}