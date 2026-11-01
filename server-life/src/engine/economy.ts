import { GAME } from "../data/constants";
import { FREE_CHOICE_NODE_IDS, NODES } from "../data/nodes";
import type { PacketType, ResourceKey } from "../data/constants";

export type OwnedNodes = Record<string, number>;

export type EconomyState = {
  credits: number;
  ownedNodes: OwnedNodes;
  lockedHardware: string[];
  passedEras: number[];
  unlockedEra: 1 | 2 | 3;
  upgradeOrder: { nodeId: string; time: string; creditsAfter: number }[];
};

export type EconomyResult =
  | { ok: true; state: EconomyState; spent: number }
  | { ok: false; state: EconomyState; reason: string };

export function createEconomyState(): EconomyState {
  return { credits: 0, ownedNodes: {}, lockedHardware: [], passedEras: [], unlockedEra: 1, upgradeOrder: [] };
}

function nodeLevel(state: EconomyState, id: string): number {
  return state.ownedNodes[id] ?? 0;
}

function stageForEra(era: 1 | 2 | 3): 1 | 2 | 3 {
  return era;
}

function nodeStage(node: (typeof NODES)[number], current: number): number {
  if (!node.hardware || current === 0) return node.tahap;
  return node.id === "cooling" ? 3 : 2;
}

export function canPurchase(state: EconomyState, nodeId: string): boolean {
  const node = NODES.find((candidate) => candidate.id === nodeId);
  if (!node) return false;
  const current = nodeLevel(state, nodeId);
  if (nodeStage(node, current) > stageForEra(state.unlockedEra)) return false;
  if (current >= node.prices.length || state.lockedHardware.includes(nodeId)) return false;
  if (node.hardware && current > 0 && node.id !== "cooling" && current < 1) return false;
  if (node.hardware && current === 1 && node.id === "cooling") return true;
  return !node.hardware || current === 0 || current >= 1;
}

export function purchase(state: EconomyState, nodeId: string): EconomyResult {
  const node = NODES.find((candidate) => candidate.id === nodeId);
  if (!node) return { ok: false, state, reason: "node-not-found" };
  const current = nodeLevel(state, nodeId);
  if (nodeStage(node, current) > state.unlockedEra) return { ok: false, state, reason: "tahap-locked" };
  if (current >= node.prices.length) return { ok: false, state, reason: "already-installed" };
  if (state.lockedHardware.includes(nodeId)) return { ok: false, state, reason: "hardware-locked" };
  if (current > 0 && node.hardware && current < 1) return { ok: false, state, reason: "requires-lv1" };
  const price = node.prices[current];
  if (state.credits < price) return { ok: false, state, reason: "insufficient-credits" };
  const next = {
    ...state,
    credits: state.credits - price,
    ownedNodes: { ...state.ownedNodes, [nodeId]: current + 1 },
    upgradeOrder: [...(state.upgradeOrder ?? []), { nodeId, time: new Date().toISOString(), creditsAfter: state.credits - price }],
  };
  return { ok: true, state: evaluateEraGates(next), spent: price };
}

export function refund(state: EconomyState, nodeId: string): EconomyResult {
  const node = NODES.find((candidate) => candidate.id === nodeId);
  if (!node || node.hardware || !FREE_CHOICE_NODE_IDS.includes(nodeId)) {
    return { ok: false, state, reason: "hardware-not-refundable" };
  }
  const current = nodeLevel(state, nodeId);
  if (current < 1) return { ok: false, state, reason: "not-installed" };
  const next = {
    ...state,
    credits: state.credits + node.prices[0],
    ownedNodes: { ...state.ownedNodes },
    upgradeOrder: [...(state.upgradeOrder ?? []), { nodeId, time: new Date().toISOString(), creditsAfter: state.credits + node.prices[0] }],
  };
  delete next.ownedNodes[nodeId];
  return { ok: true, state: next, spent: -node.prices[0] };
}

export function evaluateEraGates(state: EconomyState): EconomyState {
  let next = { ...state, lockedHardware: [...state.lockedHardware] };
  const freeCount = FREE_CHOICE_NODE_IDS.filter((id) => nodeLevel(next, id) > 0).length;
  const era2 = next.passedEras.includes(1) &&
    nodeLevel(next, "ram") >= 1 &&
    nodeLevel(next, "bandwidth") >= 1 &&
    freeCount >= 1;
  if (era2) {
    next = unlockEra(next, 2, ["ram", "bandwidth"]);
  }
  const era3 = next.passedEras.includes(2) &&
    ["ram", "bandwidth", "cpu", "storage"].every((id) => nodeLevel(next, id) >= 1) &&
    freeCount >= 3;
  if (era3) {
    next = unlockEra(next, 3, ["ram", "bandwidth", "cpu", "storage"]);
  }
  return next;
}

function unlockEra(state: EconomyState, era: 2 | 3, hardware: string[]): EconomyState {
  return {
    ...state,
    unlockedEra: Math.max(state.unlockedEra, era) as 1 | 2 | 3,
    lockedHardware: [...new Set([...state.lockedHardware, ...hardware])],
  };
}

export function markEraPassed(state: EconomyState, era: 1 | 2 | 3): EconomyState {
  if (state.passedEras.includes(era)) return state;
  return evaluateEraGates({
    ...state,
    passedEras: [...state.passedEras, era].sort(),
  });
}

export function loadPercent(
  type: PacketType,
  era: 1 | 2 | 3,
  hardware: OwnedNodes = {},
  heavy = false,
  nodes: OwnedNodes = hardware,
  options: { jamBusy?: boolean; autoscaling?: boolean } = {},
): number {
  const resource: ResourceKey = type === "WEB" ? "cpu" : type === "DATA" ? "ram" : type === "MEDIA" ? "bandwidth" : "storage";
  const level = Math.min(2, (hardware[resource] ?? 0) + GAME.economy.eraBaseLevel[era][resource]);
  const raw = GAME.economy.rawLoad[type][era - 1];
  const base = (raw / GAME.economy.capacity[resource][level]) * 100;
  const penalty = 1 + (heavy ? GAME.economy.heavyPenalty : 0);
  const discount = Math.max(
    GAME.economy.minimumLoadFactor,
    (1 - (nodes["load-balancer"] ? GAME.economy.loadBalancerDiscount : 0)) *
    (1 - (nodes["query-cache"] && type === "DATA" ? GAME.economy.queryCacheDataDiscount : 0)) *
    (1 - (nodes["rate-limiting"] && options.jamBusy ? GAME.rateLimitReduction : 0)) *
    (1 - (options.autoscaling ? GAME.autoscalingReduction : 0)),
  );
  // TODO(Stage D): apply Rate Limiting and Autoscaling terms to Faktor_Diskon.
  return Math.min(GAME.economy.maximumLoadPercent, base * penalty * discount);
}

export function settleSession(
  state: EconomyState,
  era: 1 | 2 | 3,
  result: "passed" | "failed" | "game-over",
  caughtCredits: number,
): { state: EconomyState; bonus: number; earned: number } {
  if (result === "game-over") {
    return {
      state: { ...state, credits: state.credits + caughtCredits },
      bonus: 0,
      earned: caughtCredits,
    };
  }
  const firstClear = result === "passed" && !state.passedEras.includes(era);
  const bonus = firstClear ? GAME.firstClearBonus[era] : 0;
  const earned = caughtCredits + bonus;
  const next = {
    ...state,
    credits: state.credits + earned,
    passedEras: firstClear ? [...state.passedEras, era].sort() : state.passedEras,
  };
  return { state: evaluateEraGates(next), bonus, earned };
}
