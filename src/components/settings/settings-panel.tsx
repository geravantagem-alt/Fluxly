"use client";

import { SettingsForm } from "@/components/forms/settings-form";
import type { User } from "@/types";

export function SettingsPanel({ user }: { user: User }) {
  return <SettingsForm user={user} />;
}