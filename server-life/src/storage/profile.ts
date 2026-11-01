import type { ActiveProfile } from "../engine/auth";
import type { SessionSummary } from "../engine/telemetry";
import { provisionalC4Score } from "../data/c4";

export type SessionStatus = "LULUS" | "GAGAL" | "GAME_OVER" | "ABORTED" | "IN_PROGRESS";
export type TutorialRecord = { done: boolean; completedAt?: string; quizScore?: number; quizAnswers?: Record<string, string>; durationSeconds?: number };
export type SessionRecord = {
  sessionId: string;
  era: 1 | 2 | 3;
  attempt: number;
  formIndex: 0 | 1 | 2;
  status: SessionStatus;
  gameOverCause: string | null;
  creditsEarned: number;
  firstClearBonus: number;
  slaFinal: number;
  slaMin: number;
  packetsServed: number;
  subQuota: { W: number; D: number; M: number; U: number };
  durationSeconds: number;
  nodesSnapshot: string[];
  startedAt: string;
  endedAt?: string;
  validSession?: boolean;
  summary?: SessionSummary;
  reportSeen?: boolean;
  attemptInEra?: number;
  firstAttemptMatch?: number;
  firstAttemptSnapshot?: string[];
  postReportAdaptation?: string;
  upgradeOrder?: string;
};

export type ProfileLog = {
  version: 1;
  attempt_counter: number;
  sessions: SessionRecord[];
  upgradeOrder: { nodeId: string; time: string; creditsAfter: number }[];
  tutorial?: TutorialRecord;
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

function storage(): StorageLike | undefined {
  return typeof globalThis === "undefined"
    ? undefined
    : (globalThis as { localStorage?: StorageLike }).localStorage;
}

export function profileSaveKey(kode: string): string {
  return `serverlife_save_${kode}`;
}

export function profileLogKey(kode: string): string {
  return `serverlife_log_${kode}`;
}

export function emptyProfileLog(): ProfileLog {
  return { version: 1, attempt_counter: 0, sessions: [], upgradeOrder: [], tutorial: { done: false } };
}

export function loadProfileLog(profile: ActiveProfile, source = storage()): ProfileLog {
  if (!source) return emptyProfileLog();
  try {
    const raw = source.getItem(profileLogKey(profile.kode));
    if (!raw) return emptyProfileLog();
    const parsed = JSON.parse(raw) as ProfileLog;
    if (parsed.version !== 1 || !Number.isInteger(parsed.attempt_counter) || !Array.isArray(parsed.sessions)) return emptyProfileLog();
    return { version: 1, attempt_counter: Math.max(0, parsed.attempt_counter), sessions: parsed.sessions, upgradeOrder: Array.isArray(parsed.upgradeOrder) ? parsed.upgradeOrder : [], tutorial: parsed.tutorial?.done ? parsed.tutorial : { done: false } };
  } catch {
    return emptyProfileLog();
  }
}

export function hasCompletedTutorial(profile: ActiveProfile, source = storage()): boolean {
  return loadProfileLog(profile, source).tutorial?.done === true;
}

export function completeTutorial(profile: ActiveProfile, quiz: { score: number; answers: Record<string, string>; durationSeconds: number }, target = storage()): ProfileLog {
  const log = loadProfileLog(profile, target);
  if (log.tutorial?.done) return log;
  const next = { ...log, tutorial: { done: true, completedAt: new Date().toISOString(), quizScore: quiz.score, quizAnswers: quiz.answers, durationSeconds: quiz.durationSeconds } };
  saveProfileLog(profile, next, target);
  return next;
}

export function saveProfileLog(profile: ActiveProfile, log: ProfileLog, target = storage()): void {
  target?.setItem(profileLogKey(profile.kode), JSON.stringify(log));
}

export function finalizeInterruptedSessions(profile: ActiveProfile, now = new Date().toISOString(), target = storage()): ProfileLog {
  const log = loadProfileLog(profile, target);
  const sessions = log.sessions.map((session) => session.status === "IN_PROGRESS"
    ? { ...session, status: "ABORTED" as const, creditsEarned: 0, firstClearBonus: 0, validSession: false, endedAt: now }
    : session);
  const next = { ...log, sessions };
  saveProfileLog(profile, next, target);
  return next;
}

export function beginSession(
  profile: ActiveProfile,
  era: 1 | 2 | 3,
  nodesSnapshot: string[],
  target = storage(),
): SessionRecord {
  const log = loadProfileLog(profile, target);
  const attempt = log.attempt_counter + 1;
  const formIndex = formIndexForAttempt(profile.nomorUrut, era, attempt);
  const attemptInEra = log.sessions.filter((item) => item.era === era).length + 1;
  const firstEraAttempt = log.sessions.find((item) => item.era === era && item.firstAttemptMatch !== undefined);
  const session: SessionRecord = {
    sessionId: `${profile.kode}-${Date.now()}-${attempt}`,
    era,
    attempt,
    formIndex,
    status: "IN_PROGRESS",
    gameOverCause: null,
    creditsEarned: 0,
    firstClearBonus: 0,
    slaFinal: 100,
    slaMin: 100,
    packetsServed: 0,
    subQuota: { W: 0, D: 0, M: 0, U: 0 },
    durationSeconds: 0,
    nodesSnapshot,
    startedAt: new Date().toISOString(),
    attemptInEra,
    ...((era === 2 || era === 3) && !firstEraAttempt
      ? { firstAttemptMatch: provisionalC4Score(era, nodesSnapshot), firstAttemptSnapshot: [...nodesSnapshot] }
      : {}),
  };
  saveProfileLog(profile, { ...log, attempt_counter: attempt, sessions: [...log.sessions, session] }, target);
  return session;
}

export function formIndexForAttempt(nomorUrut: number, era: 1 | 2 | 3, attempt: number): 0 | 1 | 2 {
  return ((nomorUrut + (era - 1) + attempt) % 3) as 0 | 1 | 2;
}

export function finishSession(profile: ActiveProfile, sessionId: string, update: Partial<SessionRecord>, target = storage()): SessionRecord | null {
  const log = loadProfileLog(profile, target);
  const index = log.sessions.findIndex((session) => session.sessionId === sessionId);
  if (index < 0) return null;
  const session = { ...log.sessions[index], ...update, endedAt: new Date().toISOString() };
  const sessions = [...log.sessions];
  sessions[index] = session;
  saveProfileLog(profile, { ...log, sessions }, target);
  return session;
}
