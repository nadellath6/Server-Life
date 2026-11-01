import { NODES, type NodeBranch } from "../data/nodes";
import { canPurchase, markEraPassed, purchase, refund } from "../engine/economy";
import type { EconomyState } from "../engine/economy";
import { loadEconomyState, resetEconomyState, saveEconomyState } from "../storage/localStorage";
import { clearActiveProfile, getActiveProfile } from "../engine/auth";

type IconName = "server" | "home" | "tree" | "book" | "arrow" | "coin" | "lock" | "shield";

const branchMeta: Record<NodeBranch, { name: string; description: string; icon: IconName }> = {
  hardware: { name: "Hardware", description: "Fondasi kapasitas server", icon: "server" },
  performa: { name: "Performa", description: "Proses request lebih efisien", icon: "tree" },
  keamanan: { name: "Keamanan", description: "Redam serangan dan insiden", icon: "shield" },
  ketahanan: { name: "Ketahanan", description: "Pulih cepat saat kegagalan", icon: "book" },
};

function icon(name: IconName, size = 20): string {
  const paths: Record<IconName, string> = {
    server: '<rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5"/>',
    home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    tree: '<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M12 7.5V12M6 15.5V12h12v3.5"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h5z"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 8.5c-.6-.5-1.4-.8-2.5-.8-1.5 0-2.7.8-2.7 2s1 1.7 2.8 2.1 2.8.9 2.8 2.2-1.2 2.2-2.9 2.2c-1.2 0-2.2-.4-3-1M12 6v12"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function serverMark(): string {
  return '<div class="brand"><span class="brand__mark"><span></span><span></span><span></span></span><span class="brand__text">SERVER LIFE: <b>RUN TO ENTERPRISE</b></span></div>';
}

function renderEra(id: 1 | 2 | 3, state: EconomyState): string {
  const names = { 1: "Startup", 2: "Tumbuh", 3: "Enterprise" };
  const durations = { 1: "120 detik", 2: "150 detik", 3: "180 detik" };
  const quotas = { 1: "28/48 paket", 2: "45/75 paket", 3: "72/120 paket" };
  const passed = state.passedEras.includes(id);
  const unlocked = id <= state.unlockedEra;
  const status = passed ? "Lulus" : unlocked ? "Terbuka" : "Terkunci";
  return `<button class="era-card ${unlocked ? "era-card--active" : "era-card--locked"}" data-era="${id}" ${id > 1 ? "" : ""}>
    <span class="era-number">0${id}</span><span class="era-status ${unlocked ? "" : "locked"}">${icon(unlocked ? "shield" : "lock", 15)} ${status}</span>
    <span class="era-art">${icon(id === 1 ? "server" : id === 2 ? "shield" : "tree", 44)}</span>
    <small>ERA ${id}</small><h3>${names[id]}</h3><div class="era-metrics"><span><small>DURASI</small><b>${durations[id]}</b></span><span><small>TARGET KUOTA</small><b>${quotas[id]}</b></span></div>
    <span class="${unlocked ? "era-action" : "unlock-note"}">${unlocked ? `Mulai Era ${id}` : "Syarat era belum terpenuhi"} ${unlocked ? icon("arrow", 17) : ""}</span>
  </button>`;
}

function renderBranch(branch: NodeBranch, state: EconomyState): string {
  const meta = branchMeta[branch];
  return `<div class="skill-branch"><div class="branch-heading"><span>${meta.name.slice(0, 2).toUpperCase()}</span><div><h3>${meta.name}</h3><p>${meta.description}</p></div></div><div class="branch-nodes">${
    NODES.filter((node) => node.branch === branch).map((node) => {
      const level = state.ownedNodes[node.id] ?? 0;
      const installed = level > 0;
      const requiredStage = node.hardware && level > 0 ? (node.id === "cooling" ? 3 : 2) : node.tahap;
      const locked = requiredStage > state.unlockedEra || state.lockedHardware.includes(node.id);
      const available = !locked && canPurchase(state, node.id);
      const label = state.lockedHardware.includes(node.id) ? "[PINJAMAN TERKUNCI]" : installed ? "Terpasang" : locked ? "Terkunci" : "Tersedia";
      const price = node.prices[level] ?? node.prices[node.prices.length - 1];
      const action = installed && !node.hardware
        ? `<button data-refund="${node.id}">REFUND</button>`
        : `<button data-purchase="${node.id}" ${available ? "" : "disabled"}>${icon(locked ? "lock" : "coin", 14)} ${price}</button>`;
      return `<article class="skill-node ${locked ? "locked" : installed ? "installed" : ""}"><span class="node-icon">${icon(meta.icon, 18)}</span><div class="node-copy"><span class="node-state"><i></i> ${label}</span><h4>${node.title} ${node.hardware ? `<small>Lv ${level}/2</small>` : ""}</h4><p>${node.effect}</p></div><div class="node-action"><span>${icon("coin", 14)} ${price}</span>${action}</div></article>`;
    }).join("")
  }</div></div>`;
}

export function Home(state = loadEconomyState()): string {
  const freeCount = NODES.filter((node) => !node.hardware && (state.ownedNodes[node.id] ?? 0) > 0).length;
  const debug = new URLSearchParams(window.location.search).get("debug") === "1";
  const profile = getActiveProfile();
  return `<div class="home-screen"><header class="topbar">${serverMark()}<nav><button class="nav-item active">${icon("home")} Beranda</button><button class="nav-item" data-action="skill-tree">${icon("tree")} Skill tree</button></nav><div class="wallet">${icon("coin", 18)}<span>${profile?.kode ?? "Credits"}</span><strong>${state.credits}</strong><button class="exit-button" data-logout>Keluar</button></div></header>
  <section class="hero"><div class="hero__copy"><span class="eyebrow"><i></i> SYSTEM ONLINE · ERA 01</span><span class="hero__subtitle">TokoKita System Administrator</span><h1>Server Life:<br><em>Run to Enterprise</em></h1><p>Layani request, seimbangkan sumber daya, dan bangun infrastruktur yang siap menghadapi apa pun.</p><button class="primary-button" data-route="briefing">Mulai perjalanan ${icon("arrow")}</button><div class="control-hint"><span><kbd>A</kbd><kbd>D</kbd></span><p><b>Kontrol jalur</b>Gunakan keyboard atau tombol layar</p></div></div><div class="hero__visual" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="server-stack"><div class="server-glow"></div><div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-10</b></div><div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-20</b></div><div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-30</b></div></div><span class="float-card float-card--uptime"><i></i> SLA <b>100%</b><small>Game Over &lt; 70%</small></span><span class="float-card float-card--status"><i></i> NORMAL · SYSTEM STABLE</span></div></section>
  <section class="era-section"><div class="section-heading"><div><span class="section-kicker">PILIH MISI</span><h2>Perjalanan Infrastruktur</h2></div><span class="progress-label">PROGRESS <b>${state.passedEras.length} / 3 ERA</b></span></div><div class="era-grid">${([1, 2, 3] as const).map((id) => renderEra(id, state)).join("")}</div></section>
  <section class="skill-section" id="skill-tree"><div class="section-heading"><div><span class="section-kicker">TINGKATKAN SISTEM</span><h2>Skill Tree</h2></div><p>Bangun fondasi, lalu buka node lanjutan di setiap cabang.</p></div><div class="skill-layout"><div class="skill-branches">${(["hardware", "performa", "keamanan", "ketahanan"] as NodeBranch[]).map((branch) => renderBranch(branch, state)).join("")}</div><aside class="requirements-panel"><span class="section-kicker">PROGRESS ERA 01</span><h3>Syarat Era Berikutnya</h3><p>Syarat Era 2 diperiksa langsung dari instalasi saat ini.</p><div class="requirement-list"><span class="${state.passedEras.includes(1) ? "done" : ""}"><i>1</i><b>Lulus era sebelumnya</b><small>${state.passedEras.includes(1) ? "Era 1 lulus" : "Belum lulus Era 1"}</small></span><span class="${(state.ownedNodes.ram ?? 0) > 0 && (state.ownedNodes.bandwidth ?? 0) > 0 ? "done" : ""}"><i>2</i><b>Hardware dasar</b><small>RAM Lv1 + Bandwidth Lv1</small></span><span class="${freeCount > 0 ? "done" : ""}"><i>3</i><b>Slot node pilihan</b><small>${freeCount}/1 node terpasang</small></span></div><div class="status-key"><span class="normal"><i>✓</i> Normal</span><span class="warning"><i>!</i> Waspada</span><span class="critical"><i>!</i> Kritis</span><span class="overload"><i>×</i> Overload</span></div><button class="primary-button" data-route="briefing">Mulai Era 1 ${icon("arrow")}</button></aside></div></section>${debug ? `<aside class="panel debug-panel"><b>DEBUG</b><button data-debug="credits">+100 Credits</button><button data-debug="pass1">Tandai Era 1 lulus</button><button data-debug="pass2">Tandai Era 2 lulus</button><button data-debug="reset">Reset save</button></aside>` : ""}</div>`;
}

export function attachHomeListeners(root: HTMLElement, navigate: (route: string) => void): void {
  const rerender = () => {
    root.innerHTML = `<main class="app-shell"><div class="noise"></div>${Home()}</main>`;
    attachHomeListeners(root, navigate);
  };
  root.querySelector<HTMLElement>('[data-action="skill-tree"]')?.addEventListener("click", () => root.querySelector("#skill-tree")?.scrollIntoView({ behavior: "smooth" }));
  root.querySelector<HTMLElement>("[data-logout]")?.addEventListener("click", () => {
    clearActiveProfile();
    navigate("login");
  });
  root.querySelectorAll<HTMLElement>("[data-route]").forEach((element) => element.addEventListener("click", () => navigate(element.dataset.route ?? "home")));
  root.querySelectorAll<HTMLElement>("[data-era]").forEach((element) => element.addEventListener("click", () => {
    const era = Number(element.dataset.era);
    if (era > loadEconomyState().unlockedEra) return;
    if (era === 1) navigate("briefing");
    else if (era === 2) navigate("briefing2");
    else navigate("briefing3");
  }));
  root.querySelectorAll<HTMLButtonElement>("[data-purchase]").forEach((button) => button.addEventListener("click", () => {
    const result = purchase(loadEconomyState(), button.dataset.purchase ?? "");
    if (result.ok) { saveEconomyState(result.state); rerender(); }
  }));
  root.querySelectorAll<HTMLButtonElement>("[data-refund]").forEach((button) => button.addEventListener("click", () => {
    const result = refund(loadEconomyState(), button.dataset.refund ?? "");
    if (result.ok) { saveEconomyState(result.state); rerender(); }
  }));
  root.querySelectorAll<HTMLButtonElement>("[data-debug]").forEach((button) => button.addEventListener("click", () => {
    const state = loadEconomyState();
    if (button.dataset.debug === "credits") state.credits += 100;
    if (button.dataset.debug === "pass1") { saveEconomyState(markEraPassed(state, 1)); rerender(); return; }
    if (button.dataset.debug === "pass2") { saveEconomyState(markEraPassed(state, 2)); rerender(); return; }
    if (button.dataset.debug === "reset") { resetEconomyState(); rerender(); return; }
    saveEconomyState(state);
    rerender();
  }));
}
