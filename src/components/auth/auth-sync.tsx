"use client";

import { useEffect } from "react";

import { ensureWorkspaceForOwner, mapSupabaseUserToAppUser } from "@/lib/auth-client";
import { clearBrowserSession, persistBrowserSession } from "@/lib/auth-storage";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthSync() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user || !session.access_token || !session.refresh_token) {
        if (event === "SIGNED_OUT") {
          clearBrowserSession();
        }
        return;
      }

      void (async () => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          await ensureWorkspaceForOwner(session.user);
        }

        persistBrowserSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: mapSupabaseUserToAppUser(session.user)
        });
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
