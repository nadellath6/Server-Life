import { GAME } from "../data/constants";
import type { PacketType, ResourceKey } from "../data/constants";
import {
  addLoad,
  createResourceBars,
  createResourceZones,
  createOverloadState,
  recoverBars,
} from "./resources";
import type { OverloadState, ResourceBars, ResourceZones, Zone } from "./resources";
import type { ScheduledPacket } from "./schedule";
import { loadPercent } from "./economy";
import type { OwnedNodes } from "./economy";
import { ERAS, type EraNumber } from "../data/eras";
import {
  createIncidentState,
  getIncident,
  getIncidents,
  incidentIsActive,
  ransomwareDetectionSeconds,
  ransomwareRate,
  ransomwareStartTime,
  type IncidentState,
} from "./incidents";
import { createTemperature, updateTemperature, type TemperatureState } from "./temperature";
import { addCriticalTime, createSessionSummary, recordCatch, updateSummaryMetrics, type SessionSummary } from "./telemetry";

export type PacketState = ScheduledPacket & {
  y: number;
  caught: boolean;
  spawned: boolean;
  missed: boolean;
  caughtAge: number;
};

export type DispatcherState = {
  lane: number;
  visualLane: number;
  movingTo: number | null;
  animationSeconds: number;
};

export type GameInput = { move: -1 | 0 | 1 };
export type GameOverReason = `bottleneck:${ResourceKey}` | "sla";
export type SessionResult = "active" | "passed" | "failed" | "game-over";
export type GameEvent = {
  kind: "zone" | "overload-start" | "overload-cleared" | "shedding" | "game-over" | "missed" | "incident" | "toast";
  message: string;
};
export type Toast = { message: string; seconds: number };

export type GameState = {
  time: number;
  bars: ResourceBars;
  dispatcher: DispatcherState;
  packets: PacketState[];
  credits: number;
  quotas: Record<PacketType, number>;
  zones: ResourceZones;
  overload: OverloadState;
  overloaded: Record<ResourceKey, boolean>;
  sla: number;
  slaMin: number;
  gameOver: boolean;
  gameOverReason: GameOverReason | null;
  result: SessionResult;
  events: GameEvent[];
  logLastTimes: Record<string, number>;
  era: 1 | 2 | 3;
  hardware: OwnedNodes;
  ownedNodes: OwnedNodes;
  incident: IncidentState;
  heavyRecoverySeconds: number;
  autoscaling: Record<ResourceKey, { state: "idle" | "booting" | "active" | "cooldown"; seconds: number }>;
  backupCooldownSeconds: number;
  backupCloudCooldownSeconds: number;
  temperature: TemperatureState;
  encryption: number;
  ransomwareRestored: boolean;
  overheatingCriticalSeconds: number;
  overheatingPenaltyApplied: boolean;
  ransomwarePenaltyApplied: boolean;
  toasts: Toast[];
  telemetry: SessionSummary;
};

const packetResource: Record<PacketType, ResourceKey> = {
  WEB: "cpu",
  DATA: "ram",
  MEDIA: "bandwidth",
  UPLOAD: "storage",
};

export function createGameState(
  schedule: ScheduledPacket[],
  options: { era?: EraNumber; ownedNodes?: OwnedNodes } = {},
): GameState {
  const ownedNodes = { ...(options.ownedNodes ?? {}) };
  return {
    time: 0,
    bars: createResourceBars(),
    dispatcher: {
      lane: 1,
      visualLane: 1,
      movingTo: null,
      animationSeconds: 0,
    },
    packets: schedule.map((packet) => ({
      ...packet,
      y: 0,
      caught: false,
      spawned: false,
      missed: false,
      caughtAge: 0,
    })),
    credits: 0,
    quotas: { WEB: 0, DATA: 0, MEDIA: 0, UPLOAD: 0 },
    zones: createResourceZones(),
    overload: createOverloadState(),
    overloaded: { cpu: false, ram: false, bandwidth: false, storage: false },
    sla: GAME.sla.initial,
    slaMin: GAME.sla.initial,
    gameOver: false,
    gameOverReason: null,
    result: "active",
    events: [],
    logLastTimes: {},
    era: options.era ?? 1,
    hardware: ownedNodes,
    ownedNodes,
    incident: createIncidentState(),
    heavyRecoverySeconds: 0,
    autoscaling: {
      cpu: { state: "idle", seconds: 0 },
      ram: { state: "idle", seconds: 0 },
      bandwidth: { state: "idle", seconds: 0 },
      storage: { state: "idle", seconds: 0 },
    },
    backupCooldownSeconds: 0,
    backupCloudCooldownSeconds: 0,
    temperature: createTemperature(),
    encryption: 0,
    ransomwareRestored: false,
    overheatingCriticalSeconds: 0,
    overheatingPenaltyApplied: false,
    ransomwarePenaltyApplied: false,
    toasts: [],
    telemetry: createSessionSummary(),
  };
}

function updateDispatcher(
  current: DispatcherState,
  input: GameInput,
  deltaSeconds: number,
): DispatcherState {
  let dispatcher = { ...current };

  if (dispatcher.movingTo === null && input.move !== 0) {
    const destination = Math.max(
      0,
      Math.min(GAME.laneX.length - 1, dispatcher.lane + input.move),
    );
    if (destination !== dispatcher.lane) {
      dispatcher = {
        ...dispatcher,
        movingTo: destination,
        animationSeconds: 0,
      };
    }
  }

  if (dispatcher.movingTo === null) return dispatcher;

  const animationSeconds = dispatcher.animationSeconds + deltaSeconds;
  const progress = Math.min(
    1,
    animationSeconds / GAME.dispatcherMoveSeconds,
  );
  const visualLane =
    dispatcher.lane +
    (dispatcher.movingTo - dispatcher.lane) * progress;
  const lane =
    animationSeconds >= GAME.dispatcherCommitSeconds
      ? dispatcher.movingTo
      : dispatcher.lane;

  if (progress >= 1) {
    return {
      lane,
      visualLane: lane,
      movingTo: null,
      animationSeconds: 0,
    };
  }

  return { ...dispatcher, lane, visualLane, animationSeconds };
}

export function stepGame(
  state: GameState,
  input: GameInput,
  deltaSeconds: number,
): GameState {
  if (state.gameOver || state.result !== "active") return { ...state, events: [] };
  const time = state.time + deltaSeconds;
  const dispatcher = updateDispatcher(
    state.dispatcher,
    input,
    deltaSeconds,
  );
  const packets = state.packets.map((packet) => {
    if (packet.caught) {
      return { ...packet, caughtAge: packet.caughtAge + deltaSeconds };
    }
    const age = time - packet.spawnTime;
    const spawned = age >= 0;
    const y = spawned ? (age / ERAS[state.era].fallSeconds) * GAME.catchYMax : 0;
    return { ...packet, y, spawned };
  });

  const events: GameEvent[] = [];
  const catchable = packets.find(
    (packet) =>
      packet.spawned &&
      !packet.caught &&
      !packet.missed &&
      packet.lane === dispatcher.lane &&
      packet.y >= GAME.catchYMin &&
      packet.y <= GAME.catchYMax,
  );

  let bars = state.bars;
  let overload = { ...state.overload };
  let overloaded = { ...state.overloaded };
  let credits = state.credits;
  const quotas = { ...state.quotas };
  let gameOverReason: GameOverReason | null = null;
  const incidentDefinitions = getIncidents(state.era, time);
  const incidentDefinition = incidentDefinitions[0] ?? getIncident(state.era, time);
  const incidentActive = incidentDefinitions.some((incident) => incidentIsActive(incident, time));
  const jamBusy = state.era === 1 && incidentActive;
  const overheatingActive = state.era === 3 && incidentDefinitions.some((incident) =>
    incident.id === "overheating" &&
    time >= incident.start &&
    time <= incident.start + (incident.start >= GAME.peakStartSeconds && state.ownedNodes.ups
      ? GAME.peakOverheatingDurationWithUpsSeconds
      : incident.duration),
  );
  const patchRutin = Boolean(state.ownedNodes["patch-rutin"]);
  const ransomwareScheduledStart = ransomwareStartTime(state.era, patchRutin);
  const peakRansomwareStart = GAME.peakStartSeconds +
    (patchRutin ? GAME.ransomware.patchDelaySeconds : 0);
  const ransomwareActive = state.era === 3 &&
    ((time >= ransomwareScheduledStart && time <= ransomwareScheduledStart + GAME.ransomware.duration) ||
      (time >= peakRansomwareStart && time <= peakRansomwareStart + GAME.ransomware.peakDuration));
  const autoscalingActive = (resource: ResourceKey) => state.autoscaling[resource].state === "active";
  let heavyRecoverySeconds = Math.max(0, state.heavyRecoverySeconds - deltaSeconds);
  let backupCooldownSeconds = Math.max(0, state.backupCooldownSeconds - deltaSeconds);
  let backupCloudCooldownSeconds = Math.max(0, state.backupCloudCooldownSeconds - deltaSeconds);
  let encryption = state.encryption;
  let ransomwareRestored = state.ransomwareRestored;
  let temperature = state.temperature;
  let overheatingCriticalSeconds = state.overheatingCriticalSeconds;
  let toasts = state.toasts
    .map((toast) => ({ ...toast, seconds: toast.seconds - deltaSeconds }))
    .filter((toast) => toast.seconds > 0);
  let telemetry = state.telemetry;

  if (catchable) {
    if (overloaded[packetResource[catchable.type]]) {
      gameOverReason = `bottleneck:${packetResource[catchable.type]}`;
    }
    const resource = packetResource[catchable.type];
    const k3Critical = catchable.type === "DATA" && state.zones.storage === "kritis";
    const k3Waspada = catchable.type === "DATA" && state.zones.storage === "waspada";
    const load = loadPercent(
      catchable.type,
      state.era,
      state.hardware,
      Boolean(catchable.heavy),
      state.ownedNodes,
      { jamBusy, autoscaling: autoscalingActive(resource) },
    );
    bars = addLoad(
      bars,
      resource,
      load + (k3Waspada ? GAME.k3WaspadaDataPenalty : 0) +
        (k3Critical ? GAME.k3KritisDataPenalty : 0),
    );
    if (!k3Critical) {
      credits += catchable.heavy && catchable.type !== "UPLOAD"
        ? GAME.credits[`HEAVY_${catchable.type}` as "HEAVY_WEB" | "HEAVY_DATA" | "HEAVY_MEDIA"]
        : GAME.credits[catchable.type];
      quotas[catchable.type] += 1;
    }
    if (catchable.heavy) heavyRecoverySeconds = GAME.heavyRecoverySeconds;
    catchable.caught = true;
    telemetry = recordCatch(telemetry, time, catchable.type);
  }

  packets.forEach((packet) => {
    if (packet.spawned && !packet.caught && !packet.missed && packet.y > GAME.catchYMax) {
      packet.missed = true;
      events.push({ kind: "missed", message: `MISSED ${packet.type}` });
      const resource = packetResource[packet.type];
      if (resource !== "storage" && overload[resource] > 0) {
        bars = { ...bars, [resource]: Math.max(0, bars[resource] - GAME.overload.sheddingPoints) };
        events.push({ kind: "shedding", message: `EMERGENCY SHEDDING ${RESOURCE_META_LABEL[resource]}` });
      }
    }
  });

  (Object.keys(overload) as ResourceKey[]).forEach((resource) => {
    if (bars[resource] >= 100) {
      bars = { ...bars, [resource]: 100 };
      if (!overloaded[resource]) {
        overloaded[resource] = true;
        overload[resource] = 0;
        telemetry = {
          ...telemetry,
          overloadEpisodes: [...telemetry.overloadEpisodes, { bar: resource, startedAt: time, endedBy: "active" }],
        };
        events.push({ kind: "overload-start", message: `OVERLOAD ${RESOURCE_META_LABEL[resource]}` });
      }
    }
  });

  const autoscalingFlags = {
    cpu: state.autoscaling.cpu.state === "active",
    ram: state.autoscaling.ram.state === "active",
    bandwidth: state.autoscaling.bandwidth.state === "active",
    storage: false,
  };
  const k4Multiplier = state.era === 3
    ? state.zones.cpu === "kritis"
      ? GAME.k4Multiplier.kritis
      : state.zones.cpu === "waspada"
        ? GAME.k4Multiplier.waspada
        : 1
    : 1;
  bars = recoverBars(
    bars,
    deltaSeconds,
    overload,
    overloaded,
    state.ownedNodes,
    state.zones,
    heavyRecoverySeconds > 0 ? GAME.heavyRecoveryMultiplier : 1,
    autoscalingFlags,
    state.temperature.throttling ? GAME.temperature.throttlingRecoveryMultiplier : 1,
    k4Multiplier,
  );
  (Object.keys(overload) as ResourceKey[]).forEach((resource) => {
    if (overloaded[resource] && bars[resource] < GAME.overload.clearBelow) {
      overloaded[resource] = false;
      overload[resource] = 0;
      events.push({ kind: "overload-cleared", message: `OVERLOAD CLEARED ${RESOURCE_META_LABEL[resource]}` });
      telemetry = {
        ...telemetry,
        overloadRescues: telemetry.overloadRescues + 1,
        overloadEpisodes: telemetry.overloadEpisodes.map((episode, index) =>
          index === telemetry.overloadEpisodes.map((item) => item.bar).lastIndexOf(resource) && episode.endedBy === "active"
            ? { ...episode, endedAt: time, endedBy: "rescued" as const }
            : episode),
      };
    } else if (overloaded[resource]) {
      overload[resource] = overload[resource] + deltaSeconds;
    }
  });

  const zones = updateZones(state.zones, bars, events);
  const autoscaling = updateAutoscaling(
    state.autoscaling,
    zones,
    state.ownedNodes.autoscaling > 0,
    deltaSeconds,
  );
  const ransomwareDetectionTime = ransomwareScheduledStart +
    ransomwareDetectionSeconds(Boolean(state.ownedNodes.antivirus));
  if (ransomwareActive && !ransomwareRestored && time >= ransomwareDetectionTime) {
    if (state.ownedNodes["backup-local"] && backupCooldownSeconds <= 0) {
      ransomwareRestored = true;
      encryption = 0;
      bars = { ...bars, storage: Math.max(0, bars.storage - GAME.ransomware.localRestoreStorageReduction) };
      backupCooldownSeconds = GAME.ransomware.localCooldownSeconds;
      events.push({ kind: "toast", message: "SYSTEM RESTORE: Backup Lokal" });
    } else if (state.ownedNodes["backup-cloud"] && backupCloudCooldownSeconds <= 0) {
      ransomwareRestored = true;
      encryption = 0;
      bars = { ...bars, storage: Math.max(0, bars.storage - GAME.ransomware.cloudRestoreStorageReduction) };
      backupCloudCooldownSeconds = GAME.ransomware.cloudCooldownSeconds;
      events.push({ kind: "toast", message: "SYSTEM RESTORE: Backup Cloud" });
    }
  }
  if (ransomwareActive && !ransomwareRestored) {
    encryption = Math.min(100, encryption + ransomwareRate(
      Boolean(state.ownedNodes.antivirus),
      patchRutin,
    ) * deltaSeconds);
  }
  const ransomwareWaveEnded = state.era === 3 && !ransomwareActive && state.encryption > 0;
  const ransomwareResidualPenalty = ransomwareWaveEnded &&
    state.encryption >= GAME.ransomware.residualFailureThreshold &&
    !state.ransomwarePenaltyApplied
    ? GAME.incidentSlaPenalty
    : 0;
  if (!ransomwareActive && state.era === 3 && encryption > 0) {
    encryption = 0;
    ransomwareRestored = false;
  }
  if (!ransomwareActive && state.ownedNodes["backup-local"] &&
      bars.storage >= GAME.zone.kritisEnter && backupCooldownSeconds <= 0) {
    bars = { ...bars, storage: Math.max(0, bars.storage - GAME.backupArchiveReduction) };
    backupCooldownSeconds = GAME.backupArchiveCooldownSeconds;
  } else if (!ransomwareActive && state.era === 3 && state.ownedNodes["backup-cloud"] &&
      (!state.ownedNodes["backup-local"] || backupCooldownSeconds > 0) &&
      bars.storage >= GAME.zone.kritisEnter &&
      backupCloudCooldownSeconds <= 0) {
    bars = { ...bars, storage: 20 };
    backupCloudCooldownSeconds = GAME.ransomware.cloudCooldownSeconds;
  }
  incidentDefinitions
    .filter((incident) => time >= incident.start && time - deltaSeconds < incident.start)
    .forEach((incident) => events.push({ kind: "incident", message: `NEXT EVENT ${incident.name}` }));
  const incident = updateIncident(
    state.incident,
    incidentDefinition,
    incidentActive,
    zones,
    deltaSeconds,
    time,
  );
  if (incident.failed && !state.incident.failed) {
    events.push({ kind: "incident", message: `INCIDENT FAILED ${incident.definition?.name ?? ""}` });
  }
  if (incidentActive && (state.era === 2 || state.era === 3)) {
    const ddosFactor =
      (1 - (state.ownedNodes.firewall ? GAME.firewallReduction : 0)) *
      (1 - (state.ownedNodes["rate-limiting"] ? GAME.rateLimitReduction : 0)) *
      (1 - (autoscaling.bandwidth.state === "active" ? GAME.autoscalingReduction : 0));
    bars = { ...bars, bandwidth: Math.min(100, bars.bandwidth + GAME.ddosRate * ddosFactor * deltaSeconds) };
  }
  temperature = updateTemperature(
    temperature,
    deltaSeconds,
    zones.cpu,
    state.ownedNodes,
    overheatingActive,
  );
  if (overheatingActive && temperature.value >= GAME.temperature.throttling) {
    overheatingCriticalSeconds += deltaSeconds;
  }
  const overheatingEnded = state.era === 3 && !overheatingActive &&
    state.time < GAME.peakStartSeconds &&
    state.temperature.value >= GAME.temperature.throttling;
  const overheatingPenalty = overheatingEnded &&
    overheatingCriticalSeconds >= GAME.incidentCriticalSeconds &&
    !state.overheatingPenaltyApplied
    ? GAME.incidentSlaPenalty
    : 0;
  const finalZones = updateZones(zones, bars, events);
  telemetry = addCriticalTime(telemetry, bars, deltaSeconds);
  const criticalCount = (["cpu", "ram", "bandwidth"] as ResourceKey[])
    .filter((resource) => zones[resource] === "kritis").length;
  const incidentGrace = time - incident.lastWindowEnd < GAME.incidentEvaluationTailSeconds;
  const slaRate = criticalCount >= 2
    ? GAME.sla.multipleCriticalRate
    : criticalCount === 1
      ? GAME.sla.oneCriticalRate
      : zones.cpu === "normal" && zones.ram === "normal" && zones.bandwidth === "normal"
        ? !incidentActive && !incidentGrace ? GAME.sla.normalRate : 0
        : 0;
  const slaPenalty = (incident.failed && !state.incident.failed ? GAME.incidentSlaPenalty : 0) +
    ransomwareResidualPenalty + overheatingPenalty;
  const sla = Math.max(0, Math.min(100, state.sla + slaRate * deltaSeconds - slaPenalty));
  if (overloaded.cpu && overload.cpu >= GAME.overload.durationSeconds) gameOverReason = "bottleneck:cpu";
  if (overloaded.ram && overload.ram >= GAME.overload.durationSeconds) gameOverReason = "bottleneck:ram";
  if (overloaded.bandwidth && overload.bandwidth >= GAME.overload.durationSeconds) gameOverReason = "bottleneck:bandwidth";
  if (overloaded.storage && overload.storage >= GAME.overload.durationSeconds) gameOverReason = "bottleneck:storage";
  if (temperature.value >= GAME.temperature.gameOver) gameOverReason = "bottleneck:cpu";
  if (encryption >= 100) gameOverReason = "bottleneck:storage";
  if (sla < GAME.sla.gameOverBelow) gameOverReason = "sla";
  const gameOver = gameOverReason !== null;
  const eraDefinition = ERAS[state.era];
  const finished = time >= eraDefinition.durationSeconds;
  const passed = !gameOver &&
    creditsCaught(quotas) >= eraDefinition.quota &&
    (Object.keys(eraDefinition.subQuota) as PacketType[]).every(
      (type) => quotas[type] >= eraDefinition.subQuota[type],
    );
  const result = gameOver ? "game-over" : finished ? (passed ? "passed" : "failed") : "active";
  if (gameOver && !state.gameOver) {
    events.push({ kind: "game-over", message: `GAME OVER ${gameOverReason}` });
    telemetry = { ...telemetry, gameOverCause: gameOverReason };
  }
  telemetry = updateSummaryMetrics(telemetry, {
    sla,
    temperature: temperature.value,
    encryption,
  });
  const logLastTimes = { ...state.logLastTimes };
  const visibleEvents = events.filter((event) => {
    const previous = logLastTimes[event.message];
    if (previous !== undefined && time - previous < GAME.logDebounceSeconds) return false;
    logLastTimes[event.message] = time;
    return true;
  });

  return {
    time,
    bars,
    dispatcher,
    credits,
    quotas,
    packets: packets.filter((packet) =>
      packet.caught
        ? packet.caughtAge < GAME.caughtFlashSeconds
        : packet.y < GAME.packetRemovalY,
    ),
    zones: finalZones,
    overload,
    overloaded,
    sla,
    slaMin: Math.min(state.slaMin, sla),
    gameOver,
    gameOverReason,
    result,
    events: visibleEvents,
    logLastTimes,
    era: state.era,
    hardware: state.hardware,
    ownedNodes: state.ownedNodes,
    incident,
    heavyRecoverySeconds,
    autoscaling,
    backupCooldownSeconds,
    backupCloudCooldownSeconds,
    temperature,
    encryption,
    ransomwareRestored: ransomwareActive ? ransomwareRestored : false,
    overheatingCriticalSeconds,
    overheatingPenaltyApplied: state.overheatingPenaltyApplied || overheatingPenalty > 0,
    ransomwarePenaltyApplied: state.ransomwarePenaltyApplied || ransomwareResidualPenalty > 0,
    toasts: mergeToasts(toasts, events),
    telemetry,
  };
}

function updateAutoscaling(
  current: GameState["autoscaling"],
  zones: ResourceZones,
  enabled: boolean,
  deltaSeconds: number,
): GameState["autoscaling"] {
  const next = { ...current };
  (["cpu", "ram", "bandwidth"] as ResourceKey[]).forEach((resource) => {
    const item = { ...current[resource] };
    if (!enabled) {
      next[resource] = item;
      return;
    }

    if (item.state === "idle" && zones[resource] === "kritis") {
      item.state = "booting";
      item.seconds = GAME.autoscalingBootSeconds;
    } else if (item.state === "booting") {
      item.seconds -= deltaSeconds;
      if (item.seconds <= 0) {
        item.state = "active";
        item.seconds = GAME.autoscalingActiveSeconds;
      }
    } else if (item.state === "active") {
      item.seconds -= deltaSeconds;
      if (item.seconds <= 0) {
        item.state = "cooldown";
        item.seconds = GAME.autoscalingCooldownSeconds;
      }
    } else if (item.state === "cooldown") {
      item.seconds -= deltaSeconds;
      if (item.seconds <= 0) {
        item.state = "idle";
        item.seconds = 0;
      }
    }
    next[resource] = item;
  });
  return next;
}

function mergeToasts(current: Toast[], events: GameEvent[]): Toast[] {
  const incoming = events
    .filter((event) => event.kind === "toast" || event.kind === "incident")
    .map((event) => event.message);
  if (incoming.length === 0) return current;
  const message = incoming.join(" · ");
  const recent = current[current.length - 1];
  if (recent && recent.seconds > GAME.toastDurationSeconds - GAME.toastMergeWindowSeconds) {
    return [{ message: `${recent.message} · ${message}`, seconds: GAME.toastDurationSeconds }, ...current.slice(0, -1)];
  }
  return [{ message, seconds: GAME.toastDurationSeconds }, ...current].slice(0, 2);
}

function updateIncident(
  current: IncidentState,
  definition: ReturnType<typeof getIncident>,
  active: boolean,
  zones: ResourceZones,
  deltaSeconds: number,
  time: number,
): IncidentState {
  if (!definition) return current;
  const critical = zones.bandwidth === "kritis" || zones.cpu === "kritis";
  const criticalSeconds = active && critical ? current.criticalSeconds + deltaSeconds : current.criticalSeconds;
  const windowEnd = definition.start + definition.duration + GAME.incidentEvaluationTailSeconds;
  const failed = time >= windowEnd && criticalSeconds >= GAME.incidentCriticalSeconds;
  return {
    definition,
    criticalSeconds,
    failed,
    penaltyApplied: current.penaltyApplied || failed,
    lastWindowEnd: time >= windowEnd ? windowEnd : current.lastWindowEnd,
    peak: definition.name.includes("Hari Puncak"),
  };
}

const RESOURCE_META_LABEL: Record<ResourceKey, string> = {
  cpu: "CPU",
  ram: "RAM",
  bandwidth: "BANDWIDTH",
  storage: "STORAGE",
};

function creditsCaught(quotas: Record<PacketType, number>): number {
  return quotas.WEB + quotas.DATA + quotas.MEDIA + quotas.UPLOAD;
}

function updateZones(
  previous: ResourceZones,
  bars: ResourceBars,
  events: GameEvent[],
): ResourceZones {
  const zones = { ...previous };
  (Object.keys(bars) as ResourceKey[]).forEach((resource) => {
    const value = bars[resource];
    let next: Zone = previous[resource];
    if (next === "normal") {
      if (value >= GAME.zone.kritisEnter) next = "kritis";
      else if (value >= GAME.zone.waspadaEnter) next = "waspada";
    } else if (next === "waspada") {
      if (value >= GAME.zone.kritisEnter) next = "kritis";
      else if (value <= GAME.zone.waspadaLeave) next = "normal";
    } else if (value <= GAME.zone.kritisLeave) {
      next = value <= GAME.zone.waspadaLeave ? "normal" : "waspada";
    }
    zones[resource] = next;
    if (next !== previous[resource]) {
      events.push({ kind: "zone", message: `${RESOURCE_META_LABEL[resource]} ${next.toUpperCase()}` });
    }
  });
  return zones;
}
