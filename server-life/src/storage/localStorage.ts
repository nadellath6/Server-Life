import { createEconomyState } from "../engine/economy";
import type { EconomyState } from "../engine/economy";
import { getActiveProfile } from "../engine/auth";
import { profileSaveKey } from "./profile";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

function browserStorage(): StorageLike | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
  return candidate;
}

export function saveEconomyState(state: EconomyState, storage = browserStorage(), profileCode = getActiveProfile()?.kode): void {
  if (!storage) return;
  if (!profileCode) return;
  storage.setItem(profileSaveKey(profileCode), JSON.stringify({
    version: 1,
    credits: state.credits,
    ownedNodes: state.ownedNodes,
    lockedHardware: state.lockedHardware,
    passedEras: state.passedEras,
    unlockedEra: state.unlockedEra,
    upgradeOrder: state.upgradeOrder,
  }));
}

export function loadEconomyState(storage = browserStorage(), profileCode = getActiveProfile()?.kode): EconomyState {
  if (!storage || !profileCode) return createEconomyState();
  try {
    const raw = storage.getItem(profileSaveKey(profileCode));
    if (!raw) return createEconomyState();
    const parsed = JSON.parse(raw) as Partial<EconomyState> & { version?: number };
    if (parsed.version !== 1 || typeof parsed.credits !== "number" ||
      !parsed.ownedNodes || !Array.isArray(parsed.lockedHardware) ||
      !Array.isArray(parsed.passedEras)) {
      return createEconomyState();
    }
    return {
      credits: Math.max(0, parsed.credits),
      ownedNodes: { ...parsed.ownedNodes },
      lockedHardware: [...parsed.lockedHardware],
      passedEras: parsed.passedEras.filter((era): era is number => era === 1 || era === 2 || era === 3),
      unlockedEra: parsed.unlockedEra === 2 || parsed.unlockedEra === 3 ? parsed.unlockedEra : 1,
      upgradeOrder: Array.isArray(parsed.upgradeOrder) ? parsed.upgradeOrder : [],
    };
  } catch {
    return createEconomyState();
  }
}

export function resetEconomyState(storage = browserStorage(), profileCode = getActiveProfile()?.kode): EconomyState {
  if (profileCode) storage?.removeItem?.(profileSaveKey(profileCode));
  return createEconomyState();
}
