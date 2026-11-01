import type { PacketType, ResourceKey } from "../data/constants";

export type CatchLogEntry = { time: number; type: PacketType; bar: ResourceKey };
export type OverloadEpisode = { bar: ResourceKey; startedAt: number; endedAt?: number; endedBy: "rescued" | "game-over" | "active" };
export type IncidentTelemetry = {
  id: string;
  start: number;
  duration: number;
  criticalSeconds: number;
  maxTemperature: number;
  maxEncryption: number;
  failed: boolean;
  penaltyApplied: boolean;
  warningCatches: number;
};
export type SessionSummary = {
  criticalSeconds: Record<ResourceKey, number>;
  overloadEpisodes: OverloadEpisode[];
  catchLog: CatchLogEntry[];
  incidentOutcomes: IncidentTelemetry[];
  minSla: number;
  maxTemperature: number;
  maxEncryption: number;
  autoscalingActivations: number;
  backupLocalActivations: number;
  backupCloudActivations: number;
  overloadRescues: number;
  packetsServed: number;
  servedByType: Record<PacketType, number>;
  gameOverCause: string | null;
};

export function createSessionSummary(): SessionSummary {
  return {
    criticalSeconds: { cpu: 0, ram: 0, bandwidth: 0, storage: 0 },
    overloadEpisodes: [],
    catchLog: [],
    incidentOutcomes: [],
    minSla: 100,
    maxTemperature: 40,
    maxEncryption: 0,
    autoscalingActivations: 0,
    backupLocalActivations: 0,
    backupCloudActivations: 0,
    overloadRescues: 0,
    packetsServed: 0,
    servedByType: { WEB: 0, DATA: 0, MEDIA: 0, UPLOAD: 0 },
    gameOverCause: null,
  };
}

export function recordCatch(summary: SessionSummary, time: number, type: PacketType): SessionSummary {
  const bar: ResourceKey = type === "WEB" ? "cpu" : type === "DATA" ? "ram" : type === "MEDIA" ? "bandwidth" : "storage";
  return {
    ...summary,
    catchLog: [...summary.catchLog, { time, type, bar }],
    packetsServed: summary.packetsServed + 1,
    servedByType: { ...summary.servedByType, [type]: summary.servedByType[type] + 1 },
  };
}

export function addCriticalTime(summary: SessionSummary, bars: Record<ResourceKey, number>, deltaSeconds: number): SessionSummary {
  const criticalSeconds = { ...summary.criticalSeconds };
  (Object.keys(criticalSeconds) as ResourceKey[]).forEach((bar) => {
    if (bars[bar] >= 85) criticalSeconds[bar] += deltaSeconds;
  });
  return { ...summary, criticalSeconds };
}

export function updateSummaryMetrics(summary: SessionSummary, values: { sla: number; temperature: number; encryption: number }): SessionSummary {
  return {
    ...summary,
    minSla: Math.min(summary.minSla, values.sla),
    maxTemperature: Math.max(summary.maxTemperature, values.temperature),
    maxEncryption: Math.max(summary.maxEncryption, values.encryption),
  };
}

export function overloadContributors(summary: SessionSummary, bar: ResourceKey, startedAt: number): PacketType[] {
  return [...new Set(summary.catchLog.filter((entry) => entry.bar === bar && entry.time >= startedAt - 5 && entry.time <= startedAt).map((entry) => entry.type))];
}
