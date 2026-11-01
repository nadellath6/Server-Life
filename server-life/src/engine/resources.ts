import { GAME } from "../data/constants";
import type { ResourceKey } from "../data/constants";
import type { OwnedNodes } from "./economy";

export type ResourceBars = Record<ResourceKey, number>;
export type Zone = "normal" | "waspada" | "kritis";
export type ResourceZones = Record<ResourceKey, Zone>;
export type OverloadState = Record<ResourceKey, number>;

export function createResourceBars(): ResourceBars {
  return { cpu: 0, ram: 0, bandwidth: 0, storage: 0 };
}

export function createResourceZones(): ResourceZones {
  return { cpu: "normal", ram: "normal", bandwidth: "normal", storage: "normal" };
}

export function createOverloadState(): OverloadState {
  return { cpu: 0, ram: 0, bandwidth: 0, storage: 0 };
}

export function addLoad(bars: ResourceBars, resource: ResourceKey, amount: number = GAME.load[resource]): ResourceBars {
  return {
    ...bars,
    [resource]: Math.min(100, bars[resource] + amount),
  };
}

export function recoverBars(
  bars: ResourceBars,
  deltaSeconds: number,
  overload: OverloadState = createOverloadState(),
  overloaded: Record<ResourceKey, boolean> = {
    cpu: overload.cpu > 0,
    ram: overload.ram > 0,
    bandwidth: overload.bandwidth > 0,
    storage: overload.storage > 0,
  },
  nodes: OwnedNodes = {},
  zones: Record<ResourceKey, Zone> = createResourceZones(),
  heavyMultiplier = 1,
  autoscaling: Record<ResourceKey, boolean> = { cpu: false, ram: false, bandwidth: false, storage: false },
  thermalMultiplier = 1,
  k4Multiplier = 1,
): ResourceBars {
  const recovery = (resource: ResourceKey) => {
    const base = resource === "cpu" && nodes["query-cache"] ? 9
      : resource === "ram" && nodes["query-cache"] ? 4
        : resource === "bandwidth" && nodes.cdn ? 4
          : GAME.recovery[resource];
    const k1 = resource === "cpu" && zones.ram === "waspada"
      ? GAME.k1WaspadaPenalty
      : resource === "cpu" && zones.ram === "kritis"
        ? GAME.k1KritisPenalty
        : 0;
    const k2 = resource === "ram" && zones.bandwidth === "waspada"
      ? GAME.k2WaspadaPenalty
      : resource === "ram" && zones.bandwidth === "kritis"
        ? GAME.k2KritisPenalty
        : 0;
    const floor = GAME.recovery[resource] * 0.25;
    const k4 = resource === "bandwidth" ||
      (resource === "ram" && zones.ram === "normal")
      ? k4Multiplier
      : 1;
    const thermal = resource === "cpu" ? thermalMultiplier : 1;
    const adjusted = Math.max(floor, (base - k1 - k2) * k4 * thermal * heavyMultiplier);
    return adjusted * (overloaded[resource] && !autoscaling[resource] ? GAME.overload.recoveryMultiplier : 1) +
      (autoscaling[resource] ? GAME.autoscalingRecoveryBonus[resource as "cpu" | "ram" | "bandwidth"] ?? 0 : 0);
  };
  // TODO(Stage D): apply Autoscaling's full-recovery and bonus-recovery effects.
  return {
    cpu: Math.max(0, bars.cpu - recovery("cpu") * deltaSeconds),
    ram: Math.max(0, bars.ram - recovery("ram") * deltaSeconds),
    bandwidth: Math.max(
      0,
      bars.bandwidth - recovery("bandwidth") * deltaSeconds,
    ),
    storage: Math.max(0, bars.storage - recovery("storage") * deltaSeconds),
  };
}

export function displayPercentage(value: number): number {
  return value >= 99 && value < 100 ? Math.floor(value) : value;
}
