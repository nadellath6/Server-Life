import { REPORT_TEXTS } from "../data/reportTexts";
import { overloadContributors, type SessionSummary } from "./telemetry";
import type { SessionRecord } from "../storage/profile";

export type ReportSection = { title: string; paragraphs: string[] };
export type IncidentRecommendation = { incident: string; strategy: string; mainNode: string; supportingNode: string; classification: string };
export type SessionReport = {
  status: "LULUS" | "TIDAK LULUS" | "GAME OVER";
  mainCause: string;
  sections: ReportSection[];
  recommendations: IncidentRecommendation[];
};

function barLabel(bar: string): string {
  return bar === "bandwidth" ? "Bandwidth" : bar.toUpperCase();
}

export function mainCause(record: SessionRecord, summary: SessionSummary): string {
  if (record.status === "GAME_OVER" && record.gameOverCause) return record.gameOverCause;
  const longest = (Object.entries(summary.criticalSeconds).sort((a, b) => b[1] - a[1])[0]);
  return longest && longest[1] > 0 ? `bottleneck:${longest[0]}` : "quota";
}

export function recommendations(summary: SessionSummary, nodes: string[]): IncidentRecommendation[] {
  return summary.incidentOutcomes.filter((incident) => incident.failed).map((incident) => {
    const operational = incident.warningCatches > 0 ? "kesalahan operasional" : "kekurangan node";
    if (incident.id === "ddos") return { incident: "DDoS", strategy: "Batasi trafik dan prioritaskan request penting.", mainNode: "Firewall + Rate Limiting", supportingNode: "CDN + Autoscaling", classification: operational };
    if (incident.id === "ransomware") return { incident: "Ransomware", strategy: "Pulihkan salinan sebelum enkripsi menyebar.", mainNode: "Backup Lokal/Cloud", supportingNode: "Antivirus + Patch Rutin", classification: operational };
    if (incident.id === "overheating") return { incident: "Overheating", strategy: "Kurangi beban dan jaga suhu rak.", mainNode: "Pendingin Lv2 atau UPS", supportingNode: "Pendingin Lv1", classification: operational };
    return { incident: "Jam Sibuk", strategy: "Redam antrean dan distribusikan request.", mainNode: "Rate Limiting + Query Cache + CDN", supportingNode: nodes.includes("load-balancer") ? "Load Balancer" : "CDN", classification: operational };
  });
}

export function buildReport(record: SessionRecord, summary: SessionSummary, required: { W: number; D: number; M: number; U: number }, nodes: string[]): SessionReport {
  const status = record.status === "LULUS" ? "LULUS" : record.status === "GAME_OVER" ? "GAME OVER" : "TIDAK LULUS";
  const cause = mainCause(record, summary);
  const chain = [
    `Pemicu: ${cause}.`,
    summary.overloadEpisodes.length > 0 ? "Mekanisme: beban dan recovery memicu Overload." : "Mekanisme: tekanan resource atau insiden memengaruhi layanan.",
    `Konsekuensi: SLA ${record.slaFinal}%, paket terlayani ${record.packetsServed}.`,
  ];
  return {
    status,
    mainCause: cause,
    sections: [
      { title: "Apa yang Terjadi", paragraphs: [status, cause, ...summary.overloadEpisodes.flatMap((episode) => overloadContributors(summary, episode.bar, episode.startedAt).map((type) => `Kontributor Overload ${barLabel(episode.bar)}: ${type}.`))] },
      { title: "Rantai Sebab-Akibat Teknis", paragraphs: chain.slice(0, 3) },
      { title: "Dampak Operasional", paragraphs: [`SLA akhir ${record.slaFinal}%, minimum ${record.slaMin}%.`, `Quota W/D/M/U: ${record.subQuota.W}/${required.W}, ${record.subQuota.D}/${required.D}, ${record.subQuota.M}/${required.M}, ${record.subQuota.U}/${required.U}.`, `Credits: ${record.creditsEarned} dan bonus ${record.firstClearBonus}.`] },
      { title: "Rekomendasi Cerdas Berjenjang", paragraphs: recommendations(summary, nodes).map((item) => `${item.incident}: Strategi — ${item.strategy} Node utama — ${item.mainNode}. Node pendukung — ${item.supportingNode}. (${item.classification})`) },
      { title: "Praktik di Dunia Nyata", paragraphs: [REPORT_TEXTS.realWorld.sla, REPORT_TEXTS.realWorld.backup, REPORT_TEXTS.realWorld.waf] },
    ],
    recommendations: recommendations(summary, nodes),
  };
}
