import type { PacketType } from "./constants";

export type EraNumber = 1 | 2 | 3;
export type EraPacketComposition = Record<PacketType, number> & { HEAVY: number };

export type EraDefinition = {
  id: EraNumber;
  durationSeconds: number;
  packetCount: number;
  packetCounts: EraPacketComposition;
  heavyPacketCounts: Record<PacketType, number>;
  quota: number;
  subQuota: Record<PacketType, number>;
  spawnStartSeconds: number;
  spawnEndSeconds: number;
  lastArrivalSeconds: number;
  fallSeconds: number;
};

export const ERAS: Readonly<Record<EraNumber, EraDefinition>> = Object.freeze({
  1: Object.freeze({
    id: 1,
    durationSeconds: 120,
    packetCount: 48,
    packetCounts: Object.freeze({ WEB: 20, DATA: 14, MEDIA: 10, UPLOAD: 4, HEAVY: 0 }),
    heavyPacketCounts: Object.freeze({ WEB: 0, DATA: 0, MEDIA: 0, UPLOAD: 0 }),
    quota: 28,
    subQuota: Object.freeze({ WEB: 10, DATA: 7, MEDIA: 5, UPLOAD: 2 }),
    spawnStartSeconds: 2,
    spawnEndSeconds: 114,
    lastArrivalSeconds: 117,
    fallSeconds: 3,
  }),
  2: Object.freeze({
    id: 2,
    durationSeconds: 150,
    packetCount: 75,
    packetCounts: Object.freeze({ WEB: 28, DATA: 20, MEDIA: 16, UPLOAD: 8, HEAVY: 3 }),
    heavyPacketCounts: Object.freeze({ WEB: 1, DATA: 1, MEDIA: 1, UPLOAD: 0 }),
    quota: 45,
    subQuota: Object.freeze({ WEB: 14, DATA: 10, MEDIA: 8, UPLOAD: 3 }),
    spawnStartSeconds: 2,
    spawnEndSeconds: 144,
    lastArrivalSeconds: 146.5,
    fallSeconds: 2.5,
  }),
  3: Object.freeze({
    id: 3,
    durationSeconds: 180,
    packetCount: 120,
    packetCounts: Object.freeze({ WEB: 40, DATA: 30, MEDIA: 24, UPLOAD: 12, HEAVY: 14 }),
    heavyPacketCounts: Object.freeze({ WEB: 5, DATA: 5, MEDIA: 4, UPLOAD: 0 }),
    quota: 72,
    subQuota: Object.freeze({ WEB: 22, DATA: 17, MEDIA: 14, UPLOAD: 6 }),
    spawnStartSeconds: 2,
    spawnEndSeconds: 173,
    lastArrivalSeconds: 175,
    fallSeconds: 2,
  }),
});
