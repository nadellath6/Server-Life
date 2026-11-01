import { ROSTER, ROSTER_SALT } from "../data/roster";
import type { RosterEntry } from "../data/roster";

export type ActiveProfile = Pick<RosterEntry, "kode" | "nomorUrut">;

const encoder = new TextEncoder();

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${ROSTER_SALT}${token}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function authenticate(kode: string, token: string): Promise<ActiveProfile | null> {
  const entry = ROSTER.find((candidate) => candidate.kode === kode);
  if (!entry) return null;
  // This hash only prevents selecting the wrong profile on a shared lab computer; it is not a security measure.
  return (await hashToken(token)) === entry.tokenHash
    ? { kode: entry.kode, nomorUrut: entry.nomorUrut }
    : null;
}

export function rosterOptions(): readonly RosterEntry[] {
  return ROSTER;
}

export const ACTIVE_PROFILE_KEY = "serverlife.active_profile";

function sessionStore(): Storage | undefined {
  return typeof globalThis === "undefined"
    ? undefined
    : (globalThis as { sessionStorage?: Storage }).sessionStorage;
}

export function getActiveProfile(storage = sessionStore()): ActiveProfile | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(ACTIVE_PROFILE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as ActiveProfile;
    return typeof profile.kode === "string" && Number.isInteger(profile.nomorUrut) ? profile : null;
  } catch {
    return null;
  }
}

export function setActiveProfile(profile: ActiveProfile, storage = sessionStore()): void {
  storage?.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
}

export function clearActiveProfile(storage = sessionStore()): void {
  storage?.removeItem(ACTIVE_PROFILE_KEY);
}
