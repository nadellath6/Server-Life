import { GAME } from "../data/constants";
import type { PacketType } from "../data/constants";
import type { EraNumber } from "../data/eras";
import { selectForm } from "./forms";

export type ScheduledPacket = {
  id: number;
  type: PacketType;
  lane: number;
  spawnTime: number;
  heavy?: boolean;
};

function formSchedule(era: EraNumber, formIndex: number): ScheduledPacket[] {
  return selectForm(era, formIndex).packets.map((packet, id) => ({ ...packet, id }));
}

export function createEraOneSchedule(seed = GAME.scheduleSeed): ScheduledPacket[] {
  return formSchedule(1, Math.abs(seed) % 3);
}

export function createEraTwoSchedule(seed = GAME.scheduleSeed): ScheduledPacket[] {
  return formSchedule(2, Math.abs(seed) % 3);
}

export function createEraSchedule(era: EraNumber, formIndex = 0): ScheduledPacket[] {
  return formSchedule(era, Math.abs(formIndex) % 3);
}
