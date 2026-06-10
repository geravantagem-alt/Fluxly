import type { User } from "@/types";

export const AUTH_STORAGE_KEYS = {
  accessToken: "fluxly-access-token",
  refreshToken: "fluxly-refresh-token",
  session: "fluxly-session",
  user: "fluxly-user"
} as const;

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookieValue(cookieHeader: string | undefined, key: string) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${key}=`));
  if (!match) return null;

  return safeDecode(match.slice(key.length + 1));
}

function writeCookie(key: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearCookie(key: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function persistBrowserSession(params: {
  accessToken: string;
  refreshToken: string;
  user: User;
}) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_STORAGE_KEYS.session, "active");
  window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(params.user));

  writeCookie(AUTH_STORAGE_KEYS.accessToken, params.accessToken);
  writeCookie(AUTH_STORAGE_KEYS.refreshToken, params.refreshToken);
}

export function updateStoredBrowserUser(patch: Partial<User>) {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.user);
  if (!raw) return;

  try {
    const current = JSON.parse(raw) as User;
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify({ ...current, ...patch }));
  } catch {
    // noop
  }
}

export function clearBrowserSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.session);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  }

  clearCookie(AUTH_STORAGE_KEYS.accessToken);
  clearCookie(AUTH_STORAGE_KEYS.refreshToken);
}

export function hasStoredBrowserSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.session) === "active";
}

export function readStoredBrowserUser(fallback: User) {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.user);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return fallback;
  }
}
