import { Home, attachHomeListeners } from "./home";
import { Arena } from "./arena";
import { settleSession } from "../engine/economy";
import { loadEconomyState, saveEconomyState } from "../storage/localStorage";
import { Login } from "./login";
import { getActiveProfile } from "../engine/auth";
import { beginSession, finishSession, finalizeInterruptedSessions } from "../storage/profile";
import { loadProfileLog } from "../storage/profile";
import { renderReport, resultMarkup, attachResultListeners } from "./report";
import { Tutorial } from "./tutorial";

export type Route = "login" | "tutorial" | "home" | "briefing" | "briefing2" | "briefing3" | "arena" | "arena2" | "arena3" | "report" | "result";

const routes = new Set<Route>(["login", "tutorial", "home", "briefing", "briefing2", "briefing3", "arena", "arena2", "arena3", "report", "result"]);
let lastSessionId: string | null = null;

function currentRoute(): Route {
  const value = window.location.hash.slice(1) as Route;
  return routes.has(value) ? value : "home";
}

function render(route: Route, root: HTMLElement): void {
  if (route !== "login" && !getActiveProfile()) {
    window.location.hash = "login";
    return;
  }
  if (route === "login") {
    Login(root, () => {
      const profile = getActiveProfile();
      navigate(profile && !loadProfileLog(profile).tutorial?.done ? "tutorial" : "home");
    });
    return;
  }
  if (route === "tutorial") {
    const profile = getActiveProfile();
    if (!profile) return navigate("login");
    Tutorial(root, profile, () => navigate("home"));
    return;
  }
  if (route === "home") {
    const profile = getActiveProfile();
    if (profile && !loadProfileLog(profile).tutorial?.done) return navigate("tutorial");
    root.innerHTML = `<main class="app-shell"><div class="noise"></div>${Home()}</main>`;
    attachHomeListeners(root, navigate);
    return;
  }
  if (route === "briefing" || route === "briefing2" || route === "briefing3") {
    const era = route === "briefing2" ? 2 : route === "briefing3" ? 3 : 1;
    const diagnostic = era === 1
      ? "[LOG SISTEM]: Jadwal promo makan siang aktif pada menit ke-1:30. Diprediksi terjadi lonjakan antrean request halaman web dan unduhan katalog gambar secara bersamaan dalam waktu singkat."
      : era === 2
        ? "[PERINGATAN ISP]: Terdeteksi anomali ribuan paket SYN berukuran kecil dari ratusan alamat IP asing yang membanjiri pipa jaringan secara serentak pada menit ke-1:50 tanpa melakukan transaksi."
        : "[TELEMETRI DATA CENTER]: (1) Fluktuasi daya listrik pada kipas pendingin rak utama yang memicu lonjakan panas ruang server; (2) Peringatan keamanan adanya payload berbahaya yang mencoba mengenkripsi dan mengunci berkas di partisi penyimpanan hingga tidak dapat diakses tanpa salinan pemulihan; (3) Puncak trafik belanja nasional pada menit ke-2:10.";
    root.innerHTML = `<main class="app-shell"><div class="noise"></div><section class="briefing-screen"><div class="briefing-card"><span class="briefing-step">ERA 0${era} · BRIEFING</span><h1>${era === 1 ? "Server pertamamu aktif." : era === 2 ? "Ancaman jaringan terdeteksi." : "Krisis data center terdeteksi."}</h1><p>Layani paket WEB, DATA, MEDIA, dan UPLOAD dengan memindahkan Dispatcher ke jalur paket pada garis tangkap.</p><div class="briefing-tip"><b>DIAGNOSTIC LOG</b>${diagnostic}</div><button class="primary-button" data-route="${era === 1 ? "arena" : era === 2 ? "arena2" : "arena3"}">Mulai Era ${era} →</button></div></section></main>`;
    root.querySelector<HTMLElement>("[data-route]")?.addEventListener("click", () => {
      const profile = getActiveProfile();
      if (!profile) return navigate("login");
      const economy = loadEconomyState();
      const session = beginSession(profile, era, Object.keys(economy.ownedNodes).filter((id) => economy.ownedNodes[id] > 0));
      navigate(era === 1 ? "arena" : era === 2 ? "arena2" : "arena3", session.sessionId);
    });
    return;
  }
  if (route === "arena" || route === "arena2" || route === "arena3") {
    const era = route === "arena2" ? 2 : route === "arena3" ? 3 : 1;
    let cleanup = () => {};
    const profile = getActiveProfile();
    const sessionId = pendingSessionId;
    cleanup = Arena(root, () => {
      cleanup();
      if (profile && sessionId) finishSession(profile, sessionId, { status: "ABORTED", creditsEarned: 0, firstClearBonus: 0, validSession: false });
      navigate("home");
    }, (state) => {
      cleanup();
      const economy = loadEconomyState();
      const settlement = settleSession(economy, era, state.result === "active" ? "failed" : state.result, state.credits);
      saveEconomyState(settlement.state);
      if (profile && sessionId) finishSession(profile, sessionId, {
        status: state.result === "passed" ? "LULUS" : state.result === "game-over" ? "GAME_OVER" : "GAGAL",
        gameOverCause: state.gameOverReason,
        creditsEarned: state.credits,
        firstClearBonus: settlement.bonus,
        slaFinal: state.sla,
        slaMin: state.slaMin,
        packetsServed: state.quotas.WEB + state.quotas.DATA + state.quotas.MEDIA + state.quotas.UPLOAD,
        subQuota: { W: state.quotas.WEB, D: state.quotas.DATA, M: state.quotas.MEDIA, U: state.quotas.UPLOAD },
        durationSeconds: state.time,
        validSession: true,
        summary: state.telemetry,
      });
      lastSessionId = sessionId ?? null;
      navigate("report");
    }, era as 1 | 2 | 3, sessionId ?? undefined);
    return;
  }
  if (route === "report") {
    const profile = getActiveProfile();
    const record = profile && lastSessionId ? loadProfileLog(profile).sessions.find((session) => session.sessionId === lastSessionId) : undefined;
    if (!profile || !record) return navigate("home");
    root.innerHTML = renderReport(record, profile, () => navigate("result"));
    root.querySelector("[data-result]")?.addEventListener("click", () => navigate("result"));
    root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
    return;
  }
  if (route === "result") {
    const profile = getActiveProfile();
    const record = profile && lastSessionId ? loadProfileLog(profile).sessions.find((session) => session.sessionId === lastSessionId) : undefined;
    if (!profile || !record) return navigate("home");
    root.innerHTML = resultMarkup(record, profile);
    attachResultListeners(root, record, profile, navigate);
    return;
  }
  root.innerHTML = `<main class="app-shell"><div class="noise"></div><section class="briefing-screen"><div class="briefing-card"><span class="briefing-step">SERVER LIFE</span><h1>${String(route).toUpperCase()}</h1><p>Coming soon.</p><button class="primary-button" data-route="home">Kembali ke beranda</button></div></section></main>`;
  root.querySelector<HTMLElement>("[data-route]")?.addEventListener("click", () => navigate("home"));
}

let pendingSessionId: string | null = null;

export function navigate(route: string, sessionId?: string): void {
  if (sessionId) pendingSessionId = sessionId;
  const next = routes.has(route as Route) ? route : "home";
  if (window.location.hash !== `#${next}`) {
    window.location.hash = next;
  } else {
    const root = document.querySelector<HTMLElement>("#app");
    if (root) render(next as Route, root);
  }
}

export function startRouter(root: HTMLElement): void {
  window.addEventListener("hashchange", () => render(currentRoute(), root));
  const profile = getActiveProfile();
  if (!profile) {
    if (window.location.hash !== "#login") window.location.hash = "login";
    else render("login", root);
  } else {
    finalizeInterruptedSessions(profile);
    if (window.location.hash === "#arena" || window.location.hash === "#arena2" || window.location.hash === "#arena3") {
      window.location.hash = "home";
    } else if (!window.location.hash) {
      window.location.hash = profile && !loadProfileLog(profile).tutorial?.done ? "tutorial" : "home";
    } else {
      render(currentRoute(), root);
    }
  }
}
