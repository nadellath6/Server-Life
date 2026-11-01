import { ERAS } from "../data/eras";
import { buildReport } from "../engine/report";
import type { SessionRecord } from "../storage/profile";
import { sessionCsv, csvFileName } from "../storage/csv";
import type { ActiveProfile } from "../engine/auth";

export function renderReport(record: SessionRecord, profile: ActiveProfile, onResult: () => void): string {
  const report = buildReport(record, record.summary ?? {
    criticalSeconds: { cpu: 0, ram: 0, bandwidth: 0, storage: 0 },
    overloadEpisodes: [], catchLog: [], incidentOutcomes: [], minSla: record.slaMin,
    maxTemperature: 40, maxEncryption: 0, autoscalingActivations: 0,
    backupLocalActivations: 0, backupCloudActivations: 0, overloadRescues: 0,
    packetsServed: record.packetsServed, servedByType: { WEB: record.subQuota.W, DATA: record.subQuota.D, MEDIA: record.subQuota.M, UPLOAD: record.subQuota.U },
    gameOverCause: record.gameOverCause,
  }, {
    W: ERAS[record.era].subQuota.WEB,
    D: ERAS[record.era].subQuota.DATA,
    M: ERAS[record.era].subQuota.MEDIA,
    U: ERAS[record.era].subQuota.UPLOAD,
  }, record.nodesSnapshot);
  const paragraphs = report.sections.map((section) => `<section class="report-section"><h3>${section.title}</h3>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>`).join("");
  return `<main class="app-shell"><section class="report-screen"><div class="report-card" data-profile="${profile.kode}" data-result-callback="${onResult.name}"><span class="report-label">ERA 0${record.era} · INCIDENT REPORT</span><h1>${report.status}</h1><p>${report.mainCause}</p>${paragraphs}<button class="primary-button" data-result>Lihat Hasil</button><button class="exit-button" data-home>Kembali ke Beranda</button></div></section></main>`;
}

export function resultMarkup(record: SessionRecord, profile: ActiveProfile): string {
  return `<main class="app-shell"><section class="report-screen" data-profile="${profile.kode}"><div class="report-card"><span class="report-label">HASIL SESI</span><h1>${record.status}</h1><p>Credits sesi: ${record.creditsEarned} · First-Clear Bonus: ${record.firstClearBonus}</p><p>Paket terlayani: ${record.packetsServed} · Saldo profil diperbarui.</p><button class="primary-button" data-retry>Coba Lagi</button><button class="exit-button" data-home>Kembali ke Beranda</button><button class="exit-button" data-copy>Salin CSV</button><button class="exit-button" data-download>Unduh CSV</button><small data-copy-status></small></div></section></main>`;
}

export function attachResultListeners(root: HTMLElement, record: SessionRecord, profile: ActiveProfile, navigate: (route: string) => void): void {
  const csv = () => sessionCsv(profile, {
  W: ERAS[record.era].subQuota.WEB,
  D: ERAS[record.era].subQuota.DATA,
  M: ERAS[record.era].subQuota.MEDIA,
  U: ERAS[record.era].subQuota.UPLOAD,
  });
  root.querySelector("[data-retry]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-copy]")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(csv());
    const status = root.querySelector("[data-copy-status]");
    if (status) status.textContent = "CSV tersalin.";
  });
  root.querySelector("[data-download]")?.addEventListener("click", () => {
    const blob = new Blob([csv()], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = csvFileName(profile.kode);
    link.click();
    URL.revokeObjectURL(link.href);
  });
}
