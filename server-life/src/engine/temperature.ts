import { GAME } from "../data/constants";
import type { OwnedNodes } from "./economy";
import type { Zone } from "./resources";

export type TemperatureState = {
  value: number;
  throttling: boolean;
  warning: boolean;
};

export function createTemperature(): TemperatureState {
  return { value: GAME.temperature.initial, throttling: false, warning: false };
}

export function coolingMultiplier(nodes: OwnedNodes): number {
  const level = Math.min(2, nodes.cooling ?? 0);
  return level === 2 ? GAME.temperature.coolingMultiplier.lv2
    : level === 1 ? GAME.temperature.coolingMultiplier.lv1
      : GAME.temperature.coolingMultiplier.none;
}

export function temperatureRate(
  zone: Zone,
  nodes: OwnedNodes,
  overheating: boolean,
  ups: boolean,
): number {
  const multiplier = coolingMultiplier(nodes);
  if (overheating) {
    return ((ups ? GAME.temperature.overheatingHeatWithUps : GAME.temperature.overheatingHeat) +
      GAME.temperature.cpuHeat[zone]) * multiplier;
  }
  return zone === "normal"
    ? -GAME.temperature.normalCooling
    : GAME.temperature.cpuHeat[zone] * multiplier;
}

export function updateTemperature(
  current: TemperatureState,
  deltaSeconds: number,
  zone: Zone,
  nodes: OwnedNodes,
  overheating: boolean,
): TemperatureState {
  const value = Math.max(
    GAME.temperature.minimum,
    current.value + temperatureRate(zone, nodes, overheating, Boolean(nodes.ups)) * deltaSeconds,
  );
  return {
    value,
    warning: value >= GAME.temperature.warning,
    throttling: value >= GAME.temperature.throttling,
  };
}
