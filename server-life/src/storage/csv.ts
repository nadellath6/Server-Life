import type { ActiveProfile } from "../engine/auth";
import { loadProfileLog } from "./profile";
import type { SessionRecord } from "./profile";

export const CSV_COLUMNS = [
  "kode_presensi", "session_id", "era", "attempt_counter", "attempt_in_era", "form_index", "status", "game_over_cause", "valid_session", "assisted_mode", "c2_microquiz_score", "c4_first_attempt_match", "c4_first_attempt_snapshot", "c4_post_report_adaptation", "report_seen_before", "credits_earned", "first_clear_bonus", "sla_final", "sla_min", "packets_served", "served_w", "served_d", "served_m", "served_u", "required_w", "required_d", "required_m", "required_u", "max_temperature", "max_encryption", "overload_rescues", "upgrade_order", "nodes_snapshot", "duration_s", "started_at", "ended_at",
] as const;

function cell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replaceAll('"', '""')}"`;
}

export function sessionCsv(profile: ActiveProfile, required: { W: number; D: number; M: number; U: number }, source?: Parameters<typeof loadProfileLog>[1]): string {
  const log = loadProfileLog(profile, source);
  const eraCounts = new Map<number, number>();
  const rows = log.sessions.map((session: SessionRecord) => {
    const attemptInEra = (eraCounts.set(session.era, (eraCounts.get(session.era) ?? 0) + 1), eraCounts.get(session.era));
    const summary = session.summary;
    return [
      profile.kode, session.sessionId, session.era, log.attempt_counter, attemptInEra, session.formIndex, session.status, session.gameOverCause, session.validSession ?? false, false, "", session.firstAttemptMatch ?? "", (session.firstAttemptSnapshot ?? []).join("|"), session.postReportAdaptation ?? "", session.reportSeen ?? false, session.creditsEarned, session.firstClearBonus, session.slaFinal, session.slaMin, session.packetsServed, summary?.servedByType.WEB ?? session.subQuota.W, summary?.servedByType.DATA ?? session.subQuota.D, summary?.servedByType.MEDIA ?? session.subQuota.M, summary?.servedByType.UPLOAD ?? session.subQuota.U, required.W, required.D, required.M, required.U, summary?.maxTemperature ?? "", summary?.maxEncryption ?? "", summary?.overloadRescues ?? 0, session.upgradeOrder ?? "", session.nodesSnapshot.join("|"), session.durationSeconds, session.startedAt, session.endedAt ?? "",
    ].map(cell).join(",");
  });
  return `\uFEFF${CSV_COLUMNS.join(",")}\n${rows.join("\n")}\n`;
}

export function csvFileName(kode: string, now = new Date()): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `serverlife_${kode}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;
}
