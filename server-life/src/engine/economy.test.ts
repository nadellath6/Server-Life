import { describe, expect, it } from "vitest";
import { loadPercent, purchase, refund, settleSession, createEconomyState, evaluateEraGates } from "./economy";
import { loadEconomyState, saveEconomyState } from "../storage/localStorage";
import { profileSaveKey } from "../storage/profile";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("Stage C economy", () => {
  it("requires Lv1 for hardware Lv2 and never refunds hardware", () => {
    const initial = { ...createEconomyState(), credits: 60, unlockedEra: 2 as const };
    expect(purchase(initial, "cpu").ok).toBe(true);
    const levelTwo = purchase({ ...initial, ownedNodes: { cpu: 1 } }, "cpu");
    expect(levelTwo.ok).toBe(true);
    expect(refund(levelTwo.ok ? levelTwo.state : initial, "cpu").ok).toBe(false);
  });

  it("refunds free-choice nodes at 100 percent", () => {
    const result = purchase({ ...createEconomyState(), credits: 25 }, "query-cache");
    expect(result.ok).toBe(true);
    const returned = refund(result.ok ? result.state : createEconomyState(), "query-cache");
    expect(returned.ok).toBe(true);
    expect(returned.ok && returned.state.credits).toBe(25);
  });

  it("calculates tahap availability and cumulative era gates", () => {
    const unavailable = purchase({ ...createEconomyState(), credits: 100 }, "load-balancer");
    expect(unavailable.ok).toBe(false);
    const era2 = evaluateEraGates({
      ...createEconomyState(),
      passedEras: [1],
      ownedNodes: { ram: 1, bandwidth: 1, "query-cache": 1 },
    });
    expect(era2.unlockedEra).toBe(2);
    expect(era2.lockedHardware).toEqual(["ram", "bandwidth"]);
    const era3 = evaluateEraGates({
      ...era2,
      passedEras: [1, 2],
      ownedNodes: { ...era2.ownedNodes, cpu: 1, storage: 1, cdn: 1, firewall: 1 },
    });
    expect(era3.unlockedEra).toBe(3);
    expect(era3.lockedHardware).toEqual(["ram", "bandwidth", "cpu", "storage"]);
  });

  it("applies hardware, era, discount floor, cap, and DATA cache loads", () => {
    expect(loadPercent("WEB", 1, {})).toBe(20);
    expect(loadPercent("WEB", 1, { cpu: 1 })).toBe(10);
    expect(loadPercent("WEB", 1, { cpu: 2 })).toBe(5);
    expect(loadPercent("MEDIA", 1, {})).toBe(25);
    expect(loadPercent("MEDIA", 1, { bandwidth: 1 })).toBe(12.5);
    expect(loadPercent("MEDIA", 1, { bandwidth: 2 })).toBe(5);
    expect(loadPercent("UPLOAD", 1, {})).toBe(22.5);
    expect(loadPercent("UPLOAD", 1, { storage: 1 })).toBe(11.25);
    expect(loadPercent("UPLOAD", 1, { storage: 2 })).toBe(4.5);
    expect(loadPercent("WEB", 2, {})).toBe(25);
    expect(loadPercent("WEB", 3, {})).toBe(20);
    expect(loadPercent("DATA", 1, {}, false, { "query-cache": 1 })).toBe(15);
    expect(loadPercent("DATA", 1, {}, false, { "load-balancer": 1, "query-cache": 1 })).toBeCloseTo(12);
    expect(loadPercent("MEDIA", 1, {}, true)).toBe(35);
  });

  it("settles credits and awards first-clear bonus once", () => {
    const first = settleSession(createEconomyState(), 1, "passed", 20);
    expect(first.earned).toBe(45);
    const second = settleSession(first.state, 1, "passed", 20);
    expect(second.bonus).toBe(0);
    expect(second.state.credits).toBe(65);
    expect(settleSession(second.state, 1, "game-over", 20).earned).toBe(20);
  });

  it("round-trips save data and safely falls back on corruption", () => {
    const storage = memoryStorage();
    const state = { ...createEconomyState(), credits: 42, ownedNodes: { cdn: 1 }, passedEras: [1] };
    saveEconomyState(state, storage, "A");
    expect(loadEconomyState(storage, "A")).toMatchObject(state);
    storage.setItem(profileSaveKey("A"), "{bad");
    expect(loadEconomyState(storage, "A")).toEqual(createEconomyState());
  });
});
