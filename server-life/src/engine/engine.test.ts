import { describe, expect, it } from "vitest";
import { GAME } from "../data/constants";
import { createFixedTimestep } from "./loop";
import { createEraOneSchedule } from "./schedule";
import { createGameState, stepGame } from "./state";
import { displayPercentage } from "./resources";

describe("Era 1 engine", () => {
  it("uses fixed timestep and caps accumulated time", () => {
    let steps = 0;
    const loop = createFixedTimestep(() => { steps += 1; });
    loop.advance(GAME.maxAccumulatedDeltaSeconds * 2);
    expect(steps).toBe(Math.floor(GAME.maxAccumulatedDeltaSeconds / GAME.fixedDeltaSeconds));
  });

  it("commits the lane at the midpoint, not before", () => {
    let state = createGameState([]);
    state = stepGame(state, { move: 1 }, GAME.dispatcherCommitSeconds - GAME.fixedDeltaSeconds);
    expect(state.dispatcher.lane).toBe(1);
    state = stepGame(state, { move: 0 }, GAME.fixedDeltaSeconds);
    expect(state.dispatcher.lane).toBe(2);
  });

  it("catches at most one packet per frame", () => {
    const schedule = createEraOneSchedule().slice(0, 2).map((packet) => ({
      ...packet,
      lane: 1,
      spawnTime: 117 - GAME.fallSeconds,
    }));
    const state = stepGame(
      { ...createGameState(schedule), time: 117 - GAME.fixedDeltaSeconds },
      { move: 0 },
      GAME.fixedDeltaSeconds,
    );
    expect(state.credits).toBe(GAME.credits[schedule[0].type]);
  });

  it("clamps recovery at zero", () => {
    const state = createGameState([]);
    const next = stepGame(
      { ...state, bars: { cpu: 1, ram: 1, bandwidth: 1, storage: 0 } },
      { move: 0 },
      1,
    );
    expect(next.bars).toEqual({ cpu: 0, ram: 0, bandwidth: 0, storage: 0 });
  });

  it("creates the exact Era 1 composition", () => {
    const counts = createEraOneSchedule().reduce<Record<string, number>>((result, packet) => {
      result[packet.type] = (result[packet.type] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toEqual({ WEB: 20, DATA: 14, MEDIA: 10, UPLOAD: 4 });
  });

  it("uses hysteresis for Waspada and Kritis zones", () => {
    let state = createGameState([]);
    state = stepGame({ ...state, bars: { cpu: 65, ram: 0, bandwidth: 0, storage: 0 } }, { move: 0 }, 0);
    expect(state.zones.cpu).toBe("waspada");
    state = stepGame({ ...state, bars: { ...state.bars, cpu: 63 } }, { move: 0 }, 0);
    expect(state.zones.cpu).toBe("normal");
    state = stepGame({ ...state, bars: { ...state.bars, cpu: 85 } }, { move: 0 }, 0);
    expect(state.zones.cpu).toBe("kritis");
    state = stepGame({ ...state, bars: { ...state.bars, cpu: 83.1 } }, { move: 0 }, 0);
    expect(state.zones.cpu).toBe("kritis");
    state = stepGame({ ...state, bars: { ...state.bars, cpu: 83 } }, { move: 0 }, 0);
    expect(state.zones.cpu).toBe("waspada");
  });

  it("starts overload, applies damped recovery, and clears only below 95", () => {
    let state = createGameState([]);
    state = stepGame({ ...state, bars: { cpu: 100, ram: 0, bandwidth: 0, storage: 0 } }, { move: 0 }, 1);
    expect(state.overloaded.cpu).toBe(true);
    expect(state.bars.cpu).toBeCloseTo(95.8);
    state = stepGame({ ...state, overload: { ...state.overload, cpu: 2.9 }, bars: { ...state.bars, cpu: 96 } }, { move: 0 }, 0);
    expect(state.overloaded.cpu).toBe(true);
    expect(state.result).toBe("active");
    state = stepGame({ ...state, overload: { ...state.overload, cpu: 2.9 }, bars: { ...state.bars, cpu: 100 } }, { move: 0 }, 0.1);
    expect(state.result).toBe("game-over");
  });

  it("sheds six points only for dynamic overloaded resources", () => {
    const packet = { id: 1, type: "WEB" as const, lane: 0, spawnTime: 0 };
    const base = createGameState([packet]);
    const state = stepGame({
      ...base,
      time: 3,
      bars: { cpu: 100, ram: 100, bandwidth: 100, storage: 100 },
      overloaded: { cpu: true, ram: true, bandwidth: true, storage: true },
      overload: { cpu: 1, ram: 1, bandwidth: 1, storage: 1 },
    }, { move: 0 }, 1 / 60);
    expect(state.bars.cpu).toBeLessThan(100);
    expect(state.events.some((event) => event.kind === "shedding")).toBe(true);
  });

  it("emits one missed event and never sheds UPLOAD storage", () => {
    const packet = { id: 1, type: "UPLOAD" as const, lane: 0, spawnTime: 0 };
    const base = createGameState([packet]);
    const state = stepGame({
      ...base,
      time: 3,
      bars: { cpu: 0, ram: 0, bandwidth: 0, storage: 100 },
      overloaded: { cpu: false, ram: false, bandwidth: false, storage: true },
      overload: { cpu: 0, ram: 0, bandwidth: 0, storage: 1 },
    }, { move: 0 }, 1 / 60);
    expect(state.events.filter((event) => event.kind === "missed")).toHaveLength(1);
    expect(state.bars.storage).toBe(100);
  });

  it("ends with SLA game over below the threshold and applies critical rates", () => {
    let state = createGameState([]);
    state = stepGame({
      ...state,
      sla: 70,
      bars: { cpu: 90, ram: 90, bandwidth: 0, storage: 0 },
    }, { move: 0 }, 0);
    state = stepGame({ ...state, sla: 70 }, { move: 0 }, 1);
    expect(state.sla).toBeCloseTo(68.5);
    expect(state.result).toBe("game-over");
    expect(state.gameOverReason).toBe("sla");
  });

  it("uses the display floor rule and evaluates Era 1 sub-quotas", () => {
    expect(displayPercentage(99.99)).toBe(99);
    expect(displayPercentage(100)).toBe(100);
    const state = createGameState([]);
    const passed = stepGame({
      ...state,
      time: GAME.eraDurationSeconds,
      quotas: { WEB: 10, DATA: 7, MEDIA: 5, UPLOAD: 6 },
    }, { move: 0 }, 0);
    expect(passed.result).toBe("passed");
    const failed = stepGame({
      ...state,
      time: GAME.eraDurationSeconds,
      quotas: { WEB: 10, DATA: 7, MEDIA: 5, UPLOAD: 1 },
    }, { move: 0 }, 0);
    expect(failed.result).toBe("failed");
  });
});
