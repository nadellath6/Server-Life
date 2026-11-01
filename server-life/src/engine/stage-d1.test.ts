import { describe, expect, it } from "vitest";
import { ERAS } from "../data/eras";
import { GAME } from "../data/constants";
import { createEraOneSchedule, createEraTwoSchedule } from "./schedule";
import { ddosRatePerSecond, INCIDENTS } from "./incidents";
import { createGameState, stepGame } from "./state";
import { loadPercent } from "./economy";

describe("Stage D1 Era 2 and incidents", () => {
  it("defines Era 2 composition, quotas, and fall time", () => {
    const schedule = createEraTwoSchedule();
    expect(schedule).toHaveLength(75);
    expect(schedule.filter((packet) => packet.heavy)).toHaveLength(3);
    expect(ERAS[2].subQuota).toEqual({ WEB: 14, DATA: 10, MEDIA: 8, UPLOAD: 3 });
    expect(ERAS[1].fallSeconds).toBe(3);
    expect(ERAS[2].fallSeconds).toBe(2.5);
  });

  it("pins Jam Sibuk and keeps the configured window", () => {
    const schedule = createEraOneSchedule();
    const busy = schedule.filter((packet) => packet.spawnTime >= 90 && packet.spawnTime <= 100);
    expect(busy).toHaveLength(8);
    expect(INCIDENTS[1][0]).toMatchObject({ start: 90, duration: 10 });
  });

  it("calculates DDoS flow with Firewall, Rate Limiting, and Autoscaling", () => {
    expect(ddosRatePerSecond(false, false, false)).toBe(9);
    expect(ddosRatePerSecond(true, false, false)).toBeCloseTo(3.6);
    expect(ddosRatePerSecond(false, true, false)).toBeCloseTo(5.4);
    expect(ddosRatePerSecond(true, true, false)).toBeCloseTo(2.16);
  });

  it("applies Heavy load and the five-second recovery multiplier", () => {
    expect(loadPercent("WEB", 1, {}, true)).toBeCloseTo(29);
    const schedule = [{ id: 1, type: "WEB" as const, lane: 1, spawnTime: 0, heavy: true }];
    const state = stepGame(
      { ...createGameState(schedule), time: 2.9 },
      { move: 0 },
      0.1,
    );
    expect(state.heavyRecoverySeconds).toBe(GAME.heavyRecoverySeconds);
  });

  it("applies K3 Storage penalties and blocks critical DATA quota", () => {
    const packet = { id: 1, type: "DATA" as const, lane: 1, spawnTime: 0 };
    const state = stepGame(
      {
        ...createGameState([packet], { era: 2 }),
        time: 2.4,
        bars: { cpu: 0, ram: 0, bandwidth: 0, storage: 90 },
        zones: { cpu: "normal", ram: "normal", bandwidth: "normal", storage: "kritis" },
      },
      { move: 0 },
      0.1,
    );
    expect(state.quotas.DATA).toBe(0);
    expect(state.credits).toBe(0);
    expect(state.bars.ram).toBeGreaterThan(0);
  });

  it("keeps the existing Era 1 schedule composition", () => {
    const counts = createEraOneSchedule().reduce<Record<string, number>>((result, packet) => {
      result[packet.type] = (result[packet.type] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toEqual({ WEB: 20, DATA: 14, MEDIA: 10, UPLOAD: 4 });
  });
});
