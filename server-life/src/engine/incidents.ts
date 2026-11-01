import { GAME } from "../data/constants";
import type { EraNumber } from "../data/eras";

export type IncidentId = "jam-busy" | "ddos" | "overheating" | "ransomware";
export type IncidentDefinition = {
  id: IncidentId;
  name: string;
  start: number;
  duration: number;
};

export type IncidentState = {
  definition: IncidentDefinition | null;
  criticalSeconds: number;
  failed: boolean;
  penaltyApplied: boolean;
  lastWindowEnd: number;
  peak: boolean;
};

export const INCIDENTS: Record<1 | 2 | 3, readonly IncidentDefinition[]> = {
  1: [{ id: "jam-busy", name: "Jam Sibuk", start: GAME.jamBusyStartSeconds, duration: GAME.jamBusyDurationSeconds }],
  2: [{ id: "ddos", name: "DDoS", start: GAME.ddosStartSeconds, duration: GAME.ddosDurationSeconds }],
  3: [
    { id: "overheating", name: "Overheating", start: GAME.overheatingStartSeconds, duration: GAME.temperature.overheatingDuration },
    { id: "ransomware", name: "Ransomware", start: GAME.ransomware.start, duration: GAME.ransomware.duration },
    { id: "overheating", name: "Hari Puncak: Overheating", start: GAME.peakStartSeconds, duration: GAME.peakOverheatingDurationSeconds },
    { id: "ransomware", name: "Hari Puncak: Ransomware", start: GAME.peakStartSeconds, duration: GAME.ransomware.peakDuration },
    { id: "ddos", name: "Hari Puncak: DDoS", start: GAME.peakStartSeconds, duration: GAME.peakDdosDurationSeconds },
  ],
};

export function createIncidentState(): IncidentState {
  return { definition: null, criticalSeconds: 0, failed: false, penaltyApplied: false, lastWindowEnd: -Infinity, peak: false };
}

export function getIncident(era: EraNumber, time: number): IncidentDefinition | null {
  return getIncidents(era, time)[0] ?? null;
}

export function getIncidents(era: EraNumber, time: number): IncidentDefinition[] {
  return INCIDENTS[era].filter((incident) =>
    time >= incident.start && time <= incident.start + incident.duration + GAME.incidentEvaluationTailSeconds,
  );
}

export function incidentIsActive(incident: IncidentDefinition | null, time: number): boolean {
  return incident !== null && time >= incident.start && time <= incident.start + incident.duration;
}

export function incidentWarning(era: EraNumber, time: number): number | null {
  const incident = INCIDENTS[era].find((candidate) =>
    time >= candidate.start - GAME.incidentWarningSeconds && time < candidate.start,
  );
  return incident ? incident.start - time : null;
}

export function nextIncidentName(era: EraNumber, time: number): string | null {
  const incident = INCIDENTS[era].find((candidate) =>
    time >= candidate.start - GAME.incidentWarningSeconds && time < candidate.start,
  );
  return incident?.name ?? null;
}

export function ddosRatePerSecond(
  firewall: boolean,
  rateLimiting: boolean,
  autoscaling: boolean,
): number {
  return GAME.ddosRate *
    (1 - (firewall ? GAME.firewallReduction : 0)) *
    (1 - (rateLimiting ? GAME.rateLimitReduction : 0)) *
    (1 - (autoscaling ? GAME.autoscalingReduction : 0));
}

export function ransomwareStartTime(era: EraNumber, patchRutin: boolean): number {
  return era === 3
    ? GAME.ransomware.start + (patchRutin ? GAME.ransomware.patchDelaySeconds : 0)
    : GAME.ransomware.start;
}

export function ransomwareRate(antivirus: boolean, patchRutin: boolean): number {
  const multiplier = antivirus && patchRutin
    ? GAME.ransomware.bothRateMultiplier
    : antivirus
      ? GAME.ransomware.antivirusRateMultiplier
      : patchRutin
        ? GAME.ransomware.patchRateMultiplier
        : 1;
  return GAME.ransomware.baseRate * multiplier;
}

export function ransomwareDetectionSeconds(antivirus: boolean): number {
  return antivirus
    ? GAME.ransomware.antivirusDetectionSeconds
    : GAME.ransomware.defaultDetectionSeconds;
}
