import { describe, expect, it } from "vitest";
import { ERAS } from "../data/eras";
import { GAME } from "../data/constants";
import { INCIDENTS, ransomwareDetectionSeconds, ransomwareRate, ransomwareStartTime } from "./incidents";
import { createEraSchedule } from "./schedule";
import { createGameState, stepGame } from "./state";
import { createTemperature, temperatureRate, updateTemperature } from "./temperature";

describe("Stage D2 Era 3 systems", () => {
  it("defines Era 3 composition, quotas, and fall time", () => {
    const schedule = createEraSchedule(3);
    expect(schedule).toHaveLength(120);
    expect(schedule.filter((packet) => packet.heavy)).toHaveLength(14);
    expect(ERAS[3].subQuota).toEqual({ WEB: 22, DATA: 17, MEDIA: 14, UPLOAD: 6 });
    expect(ERAS[3].fallSeconds).toBe(2);
  });

  it("applies temperature heat and cooling multipliers", () => {
    expect(temperatureRate("normal", {}, true, false)).toBeCloseTo(2.7);
    expect(updateTemperature(createTemperature(), 20, "normal", {}, true).value).toBeCloseTo(94);
    expect(updateTemperature(createTemperature(), 20, "normal", { cooling: 1 }, true).value).toBeCloseTo(77.8);
    expect(updateTemperature(createTemperature(), 12, "normal", { ups: 1 }, true).value).toBeCloseTo(66.4);
    expect(updateTemperature(createTemperature(), 20, "normal", {}, true).throttling).toBe(true);
  });

  it("defines Era 3 incident schedule and ransomware modifiers", () => {
    expect(INCIDENTS[3]).toMatchObject([
      { id: "overheating", start: 40, duration: 20 },
      { id: "ransomware", start: 75, duration: 20 },
      { id: "overheating", start: 130 },
      { id: "ransomware", start: 130 },
      { id: "ddos", start: 130, duration: 12 },
    ]);
    expect(ransomwareStartTime(3, false)).toBe(75);
    expect(ransomwareStartTime(3, true)).toBe(85);
    expect(ransomwareDetectionSeconds(false)).toBe(6);
    expect(ransomwareDetectionSeconds(true)).toBe(3);
    expect(ransomwareRate(false, false)).toBeCloseTo(6.25);
    expect(ransomwareRate(true, false)).toBeCloseTo(3.125);
    expect(ransomwareRate(false, true)).toBeCloseTo(3.75);
    expect(ransomwareRate(true, true)).toBeCloseTo(1.875);
  });

  it("ends an unprotected ransomware wave at game over when encryption reaches 100%", () => {
    const state = stepGame(
      { ...createGameState([{ id: 1, type: "WEB", lane: 1, spawnTime: 0 }], { era: 3 }), time: 75 },
      { move: 0 },
      16,
    );
    expect(state.encryption).toBe(100);
    expect(state.gameOver).toBe(true);
    expect(state.gameOverReason).toBe("bottleneck:storage");
  });

  it("restores ransomware with local backup and starts its cooldown", () => {
    const state = stepGame(
      {
        ...createGameState([{ id: 1, type: "WEB", lane: 1, spawnTime: 0 }], {
          era: 3,
          ownedNodes: { "backup-local": 1 },
        }),
        time: 81,
        encryption: 20,
      },
      { move: 0 },
      0.1,
    );
    expect(state.encryption).toBe(0);
    expect(state.backupCooldownSeconds).toBe(GAME.ransomware.localCooldownSeconds);
  });
});
