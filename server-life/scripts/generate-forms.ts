import { writeFileSync } from "node:fs";
type EraNumber = 1 | 2 | 3;
const ERAS = {
  1: { packetCounts: { WEB: 20, DATA: 14, MEDIA: 10, UPLOAD: 4, HEAVY: 0 }, heavyPacketCounts: { WEB: 0, DATA: 0, MEDIA: 0 }, spawnStartSeconds: 2, spawnEndSeconds: 114 },
  2: { packetCounts: { WEB: 28, DATA: 20, MEDIA: 16, UPLOAD: 8, HEAVY: 3 }, heavyPacketCounts: { WEB: 1, DATA: 1, MEDIA: 1 }, spawnStartSeconds: 2, spawnEndSeconds: 144 },
  3: { packetCounts: { WEB: 40, DATA: 30, MEDIA: 24, UPLOAD: 12, HEAVY: 14 }, heavyPacketCounts: { WEB: 5, DATA: 5, MEDIA: 4 }, spawnStartSeconds: 2, spawnEndSeconds: 173 },
} as const;
const INCIDENTS = {
  1: [{ id: "jam-busy", start: 90, duration: 10 }],
  2: [{ id: "ddos", start: 110, duration: 12 }],
  3: [{ id: "overheating", start: 40, duration: 20 }, { id: "ransomware", start: 75, duration: 20 }, { id: "overheating", start: 130, duration: 20 }, { id: "ransomware", start: 130, duration: 20 }, { id: "ddos", start: 130, duration: 12 }],
} as const;
const FAIR_LANE_EXTRA_MARGIN = 0;

type Packet = { type: "WEB" | "DATA" | "MEDIA" | "UPLOAD"; lane: number; spawnTime: number; heavy?: boolean };
function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(values: T[], random: () => number): T[] {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
function createPackets(era: EraNumber, form: number): Packet[] {
  const definition = ERAS[era];
  const random = mulberry32(0x51f15e + era * 97 + form * 31);
  if (era === 1) {
    const pinned = shuffle(["MEDIA", "MEDIA", "MEDIA", "MEDIA", "WEB", "WEB", "DATA", "DATA"] as Packet["type"][], random)
      .map((type, index) => ({ type, lane: Math.floor(random() * 3), spawnTime: 90 + index * 1.25 }));
    const remaining = shuffle([
      ...Array(18).fill("WEB"),
      ...Array(12).fill("DATA"),
      ...Array(6).fill("MEDIA"),
      ...Array(4).fill("UPLOAD"),
    ] as Packet["type"][], random).map((type, index) => ({
      type,
      lane: Math.floor(random() * 3),
      spawnTime: index < 20 ? 2 + index / 19 * 87.5 : 100.01 + (index - 20) / 19 * 13.99,
    }));
    return [...pinned, ...remaining].sort((a, b) => a.spawnTime - b.spawnTime);
  }
  const baseTypes = shuffle([
    ...Array(definition.packetCounts.WEB).fill("WEB"),
    ...Array(definition.packetCounts.DATA).fill("DATA"),
    ...Array(definition.packetCounts.MEDIA).fill("MEDIA"),
    ...Array(definition.packetCounts.UPLOAD).fill("UPLOAD"),
  ] as Packet["type"][], random);
  const heavyTypes = shuffle([
    ...Array(definition.heavyPacketCounts.WEB).fill("WEB"),
    ...Array(definition.heavyPacketCounts.DATA).fill("DATA"),
    ...Array(definition.heavyPacketCounts.MEDIA).fill("MEDIA"),
  ] as Packet["type"][], random);
  const types = [...baseTypes, ...heavyTypes];
  const packets = types.map((type, id) => {
    const heavy = id >= baseTypes.length;
    const lane = Math.floor(random() * 3);
    return { type, lane, heavy: heavy || undefined, spawnTime: definition.spawnStartSeconds + id / (types.length - 1) * (definition.spawnEndSeconds - definition.spawnStartSeconds) };
  });
  return packets.map((packet, index) => index === 0 ? packet : ({
    ...packet,
    spawnTime: Math.max(packet.spawnTime, packets[index - 1].spawnTime + 0.16 * Math.abs(packet.lane - packets[index - 1].lane) + FAIR_LANE_EXTRA_MARGIN),
  })).sort((a, b) => a.spawnTime - b.spawnTime);
}
const forms = [];
for (const era of [1, 2, 3] as const) {
  for (const formIndex of [0, 1, 2] as const) {
    forms.push({
      era,
      formIndex,
      packets: createPackets(era, formIndex),
      incidentSchedule: INCIDENTS[era],
    });
  }
}
const output = `import type { GeneratedForm } from "../engine/forms";\n\n// Bot-based calibration (>= 40 candidates per era, within +/-1 SD) is performed separately.\nexport const FORMS: readonly GeneratedForm[] = ${JSON.stringify(forms, null, 2)};\n`;
writeFileSync("src/data/forms.generated.ts", output);
