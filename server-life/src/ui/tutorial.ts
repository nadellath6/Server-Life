import { TUTORIAL } from "../data/tutorialScript";
import { buildReport } from "../engine/report";
import { createEconomyState, purchase, refund } from "../engine/economy";
import type { EconomyState } from "../engine/economy";
import { createTutorialState, scoreQuiz, stepTutorial, type QuizAnswers } from "../engine/tutorial";
import { completeTutorial, loadProfileLog } from "../storage/profile";
import type { ActiveProfile } from "../engine/auth";

const resourceInfo = [
  ["CPU", "Memproses halaman WEB. Recovery berlangsung dari waktu ke waktu."],
  ["RAM", "Menampung query DATA. Recovery berlangsung dari waktu ke waktu."],
  ["Bandwidth", "Menyalurkan MEDIA untuk unduh atau streaming. Recovery berlangsung dari waktu ke waktu."],
  ["Storage", "Menyimpan UPLOAD. Bar ini tidak pulih otomatis."],
] as const;

const pairOptions = ["WEB", "DATA", "MEDIA", "UPLOAD"] as const;

export function Tutorial(root: HTMLElement, profile: ActiveProfile, onComplete: () => void): () => void {
  let step = 1;
  let quizAnswers: QuizAnswers = {};
  let quizSubmitted = false;
  let quizScore = 0;
  let demoEconomy: EconomyState = { ...createEconomyState(), credits: TUTORIAL.demoCredits };
  let tutorialState = createTutorialState();
  let packetResolved = 0;
  const startedAt = performance.now();

  const render = () => {
    const log = loadProfileLog(profile);
    const quiz = quizSubmitted
      ? `<div class="tutorial-result">Skor pertama: <b>${quizScore}/${TUTORIAL.quizPairCount}</b><p>CPU–WEB memproses halaman; RAM–DATA menangani query; Bandwidth–MEDIA mengalirkan gambar; Storage–UPLOAD menyimpan berkas.</p></div>`
      : `<div class="tutorial-quiz">${resourceInfo.map(([resource]) => `<label>${resource}<select data-quiz="${resource}"><option value="">Pilih layanan</option>${pairOptions.map((option) => `<option value="${option}" ${quizAnswers[resource as keyof QuizAnswers] === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>`).join("")}<button class="primary-button" data-submit-quiz>Periksa jawaban</button></div>`;
    const content = step === 1
      ? `<h1>Peran & Tujuan</h1><p>Kamu adalah System Administrator TokoKita. Jaga SLA tetap stabil dan penuhi kuota trafik.</p><div class="tutorial-callout">Setiap keputusanmu menjaga layanan tetap siap dipakai pelanggan.</div>`
      : step === 2
        ? `<h1>Empat Sumber Daya</h1><p>Ketuk kartu untuk melihat fungsi setiap bar.</p><div class="tutorial-resources">${resourceInfo.map(([name, text]) => `<button class="tutorial-resource" data-resource="${name}"><b>${name}</b><span>${text}</span></button>`).join("")}</div><div class="tutorial-demo"><b>Demo K1</b><span>Naiknya beban RAM memperlambat recovery CPU.</span><i class="k1-demo"></i></div><h2>Kuis Mikro C2</h2>${quiz}`
        : step === 3
          ? `<h1>Dispatcher, Overload & Kuota</h1><p>Latihan tetap memakai state engine yang sama. Ikuti hint sebelum setiap paket.</p><div class="tutorial-arena"><div class="tutorial-lanes"><span>A</span><span>B</span><span>C</span></div><p data-tutorial-hint>${packetResolved < TUTORIAL.packetCount ? `Paket ${packetResolved + 1} dari ${TUTORIAL.packetCount}: pindahkan Dispatcher lalu tangkap.` : "Semua paket selesai."}</p><button class="primary-button" data-resolve-packet ${packetResolved >= TUTORIAL.packetCount ? "disabled" : ""}>${packetResolved >= TUTORIAL.packetCount ? "Latihan selesai" : "Selesaikan paket"}</button></div><small>Overload berlangsung ${TUTORIAL.overloadDurationSeconds.toFixed(1)} detik; turunkan beban ke &lt;${TUTORIAL.overloadClearBelow}%.</small>`
          : step === 4
            ? `<h1>Credits, Skill Tree & Refund</h1><p>Demo ini memakai state ekonomi terpisah dari profilmu.</p><div class="tutorial-wallet">DEMO CREDITS <b>${demoEconomy.credits}</b></div><div class="tutorial-node-list"><button data-demo-buy ${demoEconomy.ownedNodes["query-cache"] ? "disabled" : ""}>Beli Query Cache</button><button data-demo-refund ${demoEconomy.ownedNodes["query-cache"] ? "" : "disabled"}>Refund 100%</button><button disabled>Hardware CPU · tidak dapat di-refund</button></div>`
            : `<h1>Empat Insiden & Log Diagnostik</h1><p>Kenali gejala sebelum masuk arena.</p><div class="incident-preview"><span>Jam Sibuk · antrean request meningkat</span><span>DDoS · trafik SYN membanjiri jaringan</span><span>Overheating · suhu rak meningkat</span><span>Ransomware · berkas dienkripsi</span></div><div class="tutorial-report"><b>Contoh Incident Report</b><p>${buildReport({ status: "GAGAL", gameOverCause: null, slaFinal: 92, slaMin: 92, packetsServed: 4, creditsEarned: 4, firstClearBonus: 0, subQuota: { W: 1, D: 1, M: 1, U: 1 } } as never, tutorialState.telemetry, { W: 1, D: 1, M: 1, U: 1 }, []).sections[0].paragraphs[0]}</p></div><button class="primary-button" data-finish>Mulai bermain</button>`;
    const canNext = step === 2 ? quizSubmitted : step === 3 ? packetResolved >= TUTORIAL.packetCount : true;
    root.innerHTML = `<main class="app-shell"><section class="tutorial-screen"><div class="tutorial-card"><span class="briefing-step">SERVER LIFE · TUTORIAL</span><div class="tutorial-progress">Langkah ${step} dari ${TUTORIAL.stepCount}</div>${content}<div class="tutorial-actions">${step > 1 ? `<button class="exit-button" data-back>Kembali</button>` : ""}${step < TUTORIAL.stepCount ? `<button class="primary-button" data-next ${canNext ? "" : "disabled"}>Lanjut</button>` : ""}</div></div></section></main>`;
    root.querySelectorAll<HTMLButtonElement>("[data-resource]").forEach((button) => button.addEventListener("click", () => button.classList.toggle("selected")));
    root.querySelectorAll<HTMLSelectElement>("[data-quiz]").forEach((select) => select.addEventListener("change", () => { quizAnswers[select.dataset.quiz as keyof QuizAnswers] = select.value as never; }));
    root.querySelector("[data-submit-quiz]")?.addEventListener("click", () => { quizScore = scoreQuiz(quizAnswers); quizSubmitted = true; render(); });
    root.querySelector("[data-next]")?.addEventListener("click", () => { step += 1; render(); });
    root.querySelector("[data-back]")?.addEventListener("click", () => { step -= 1; render(); });
    root.querySelector("[data-resolve-packet]")?.addEventListener("click", () => {
      if (packetResolved >= TUTORIAL.packetCount) return;
      tutorialState = stepTutorial(tutorialState, { move: 0 }, 1 / 60);
      packetResolved += 1;
      render();
    });
    root.querySelector("[data-demo-buy]")?.addEventListener("click", () => { const result = purchase(demoEconomy, "query-cache"); if (result.ok) { demoEconomy = result.state; render(); } });
    root.querySelector("[data-demo-refund]")?.addEventListener("click", () => { const result = refund(demoEconomy, "query-cache"); if (result.ok) { demoEconomy = result.state; render(); } });
    root.querySelector("[data-finish]")?.addEventListener("click", () => {
      if (!log.tutorial?.done) completeTutorial(profile, { score: quizScore, answers: quizAnswers as Record<string, string>, durationSeconds: (performance.now() - startedAt) / 1000 });
      onComplete();
    });
  };
  render();
  return () => {};
}
