import type { PacketType } from "./constants";
import type { ScheduledPacket } from "../engine/schedule";

export const TUTORIAL = Object.freeze({
  stepCount: 5,
  demoCredits: 50,
  packetCount: 6,
  quizPairCount: 4,
  minTapTargetPx: 44,
  mobileBreakpointPx: 768,
  touchButtonMinHeightPx: 48,
  presetBandwidth: 80,
  overloadClearBelow: 95,
  overloadDurationSeconds: 3,
  rejectedSlaPenalty: 6,
  packets: Object.freeze([
    { type: "WEB" as PacketType, lane: 0, spawnTime: 0 },
    { type: "DATA" as PacketType, lane: 1, spawnTime: 4 },
    { type: "MEDIA" as PacketType, lane: 2, spawnTime: 8 },
    { type: "MEDIA" as PacketType, lane: 0, spawnTime: 12 },
    { type: "MEDIA" as PacketType, lane: 1, spawnTime: 16 },
    { type: "UPLOAD" as PacketType, lane: 2, spawnTime: 20 },
  ]),
  outcomes: Object.freeze(["caught", "caught", "caught", "caught", "rejected", "caught"] as const),
});

export type TutorialPacket = (typeof TUTORIAL.packets)[number];
export const tutorialSchedule = (): ScheduledPacket[] => TUTORIAL.packets.map((packet, id) => ({ ...packet, id }));
