type IconName = "server" | "home" | "tree" | "book" | "arrow" | "coin" | "lock" | "shield";

type SkillNode = {
  id: string;
  title: string;
  detail: string;
  price: string;
  icon: Exclude<IconName, "home" | "arrow" | "coin" | "lock" | "shield"> | "shield";
  level?: string;
  dependency?: string;
};

type Era = {
  id: number;
  name: string;
  duration: string;
  quota: string;
  incidents: string[];
  status: "Terbuka" | "Terkunci";
  requirement?: string;
  icon: IconName;
};

const eras: Era[] = [
  { id: 1, name: "Startup", duration: "120 detik", quota: "28/48 paket", incidents: ["Jam Sibuk"], status: "Terbuka", icon: "server" },
  { id: 2, name: "Tumbuh", duration: "150 detik", quota: "45/75 paket", incidents: ["DDoS", "Overheating"], status: "Terkunci", requirement: "Lulus Era 1 · SLA ≥ 85%", icon: "shield" },
  { id: 3, name: "Enterprise", duration: "180 detik", quota: "72/120 paket", incidents: ["Ransomware", "Hari Puncak"], status: "Terkunci", requirement: "Lulus Era 2 · 3 node pilihan", icon: "tree" },
];

const skillBranches: { name: string; description: string; nodes: SkillNode[] }[] = [
  {
    name: "Hardware",
    description: "Fondasi kapasitas server",
    nodes: [
      { id: "cpu", title: "CPU", level: "Lv1 · Lv2", detail: "Kapasitas proses meningkat", price: "20", icon: "server" },
      { id: "ram", title: "RAM", level: "Lv1 · Lv2", detail: "Kapasitas memori meningkat", price: "20", icon: "server", dependency: "cpu" },
      { id: "bandwidth", title: "Bandwidth", level: "Lv1 · Lv2", detail: "Kapasitas trafik meningkat", price: "25", icon: "server", dependency: "ram" },
      { id: "storage", title: "Storage", level: "Lv1 · Lv2", detail: "Ruang data meningkat", price: "20", icon: "server", dependency: "bandwidth" },
    ],
  },
  {
    name: "Performa",
    description: "Proses request lebih efisien",
    nodes: [
      { id: "cache", title: "Query Cache & Indexing", detail: "Beban query database berkurang", price: "25", icon: "tree" },
      { id: "cdn", title: "CDN", detail: "Beban bandwidth berkurang", price: "25", icon: "tree", dependency: "cache" },
      { id: "load-balancer", title: "Load Balancer", detail: "Distribusi trafik lebih merata", price: "40", icon: "tree", dependency: "cdn" },
      { id: "autoscaling", title: "Autoscaling", detail: "Kapasitas naik saat beban tinggi", price: "50", icon: "tree", dependency: "load-balancer" },
    ],
  },
  {
    name: "Keamanan",
    description: "Redam serangan dan insiden",
    nodes: [
      { id: "firewall", title: "Firewall", detail: "Saring paket botnet", price: "30", icon: "shield" },
      { id: "rate-limit", title: "Rate Limiting", detail: "Batasi request berlebih", price: "35", icon: "shield", dependency: "firewall" },
      { id: "antivirus", title: "Antivirus", detail: "Deteksi malware lebih dini", price: "30", icon: "shield", dependency: "rate-limit" },
      { id: "patch", title: "Patch Rutin", detail: "Tutup celah kerentanan", price: "35", icon: "shield", dependency: "antivirus" },
    ],
  },
  {
    name: "Ketahanan",
    description: "Pulih cepat saat kegagalan",
    nodes: [
      { id: "cooling", title: "Pendingin", level: "Lv1 · Lv2", detail: "Kurangi laju kenaikan suhu", price: "30", icon: "book" },
      { id: "backup-local", title: "Backup Lokal", detail: "Restore data lokal", price: "40", icon: "book", dependency: "cooling" },
      { id: "backup-cloud", title: "Backup Cloud", detail: "Restore data lintas lokasi", price: "60", icon: "book", dependency: "backup-local" },
      { id: "ups", title: "UPS", detail: "Cadangkan daya pendingin", price: "25", icon: "book", dependency: "backup-cloud" },
    ],
  },
];

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

function renderEra(era: Era): string {
  const locked = era.status === "Terkunci";
  return `<button class="era-card ${locked ? "era-card--locked" : "era-card--active"}" data-era="${era.id}" ${locked ? "disabled" : ""}>
    <span class="era-number">0${era.id}</span>
    <span class="era-status ${locked ? "locked" : ""}">${icon(locked ? "lock" : "shield", 15)} ${era.status}</span>
    <span class="era-art">${icon(era.icon, 44)}</span>
    <small>ERA ${era.id}</small><h3>${era.name}</h3>
    <div class="era-metrics"><span><small>DURASI</small><b>${era.duration}</b></span><span><small>TARGET KUOTA</small><b>${era.quota}</b></span></div>
    <div class="incident-list">${era.incidents.map((incident) => `<span>${incident}</span>`).join("")}</div>
    <span class="${locked ? "unlock-note" : "era-action"}">${locked ? era.requirement : "Pilih Era 1"} ${locked ? "" : icon("arrow", 17)}</span>
  </button>`;
}

function renderBranch(branch: (typeof skillBranches)[number]): string {
  return `<div class="skill-branch"><div class="branch-heading"><span>${branch.name.slice(0, 2).toUpperCase()}</span><div><h3>${branch.name}</h3><p>${branch.description}</p></div></div>
    <div class="branch-nodes">${branch.nodes.map((node) => `<article class="skill-node locked">
      <span class="node-icon">${icon(node.icon, 18)}</span><div class="node-copy"><span class="node-state"><i></i> Tersedia</span><h4>${node.title} ${node.level ? `<small>${node.level}</small>` : ""}</h4><p>${node.detail}</p></div>
      <div class="node-action"><span>${icon("coin", 14)} ${node.price}</span><button disabled>${icon("lock", 14)}</button></div>
    </article>`).join("")}</div></div>`;
}

export function Home(): string {
  return `<div class="home-screen"><header class="topbar">${serverMark()}<nav>
    <button class="nav-item active">${icon("home")} Beranda</button><button class="nav-item" data-action="skill-tree">${icon("tree")} Skill tree</button>
  </nav><div class="wallet">${icon("coin", 18)}<span>Credits</span><strong>0</strong></div></header>
  <section class="hero"><div class="hero__copy"><span class="eyebrow"><i></i> SYSTEM ONLINE · ERA 01</span><span class="hero__subtitle">TokoKita System Administrator</span>
    <h1>Server Life:<br><em>Run to Enterprise</em></h1><p>Layani request, seimbangkan sumber daya, dan bangun infrastruktur yang siap menghadapi apa pun.</p>
    <button class="primary-button" data-route="briefing">Mulai perjalanan ${icon("arrow")}</button><div class="control-hint"><span><kbd>A</kbd><kbd>D</kbd></span><p><b>Kontrol jalur</b>Gunakan keyboard atau tombol layar</p></div>
  </div><div class="hero__visual" aria-hidden="true"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="server-stack"><div class="server-glow"></div>
    <div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-10</b></div><div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-20</b></div><div class="rack"><span class="rack__lights"><i></i><i></i><i></i></span><span class="rack__vents"></span><b>SL-30</b></div>
  </div><span class="float-card float-card--uptime"><i></i> SLA <b>100%</b><small>Game Over &lt; 70%</small></span><span class="float-card float-card--status"><i></i> NORMAL · SYSTEM STABLE</span></div></section>
  <section class="era-section"><div class="section-heading"><div><span class="section-kicker">PILIH MISI</span><h2>Perjalanan Infrastruktur</h2></div><span class="progress-label">PROGRESS <b>0 / 3 ERA</b></span></div><div class="era-grid">${eras.map(renderEra).join("")}</div></section>
  <section class="skill-section" id="skill-tree"><div class="section-heading"><div><span class="section-kicker">TINGKATKAN SISTEM</span><h2>Skill Tree</h2></div><p>Bangun fondasi, lalu buka node lanjutan di setiap cabang.</p></div>
    <div class="skill-layout"><div class="skill-branches">${skillBranches.map(renderBranch).join("")}</div><aside class="requirements-panel"><span class="section-kicker">PROGRESS ERA 01</span><h3>Syarat Era Berikutnya</h3><p>Lengkapi fondasi Startup untuk membuka Era Tumbuh.</p>
      <div class="requirement-list"><span class="done"><i>✓</i><b>Hardware dasar</b><small>CPU, RAM, Bandwidth, Storage</small></span><span><i>1</i><b>Slot node pilihan</b><small>0/1 node terpasang</small></span><span><i>2</i><b>Target operasional</b><small>SLA minimum 85%</small></span></div>
      <div class="status-key"><span class="normal"><i>✓</i> Normal</span><span class="warning"><i>!</i> Waspada</span><span class="critical"><i>!</i> Kritis</span><span class="overload"><i>×</i> Overload</span></div><button class="primary-button" data-route="briefing">Mulai Era 1 ${icon("arrow")}</button>
    </aside></div></section></div>`;
}

export function attachHomeListeners(root: HTMLElement, navigate: (route: string) => void): void {
  root.querySelector<HTMLElement>('[data-action="skill-tree"]')?.addEventListener("click", () => {
    root.querySelector("#skill-tree")?.scrollIntoView({ behavior: "smooth" });
  });
  root.querySelectorAll<HTMLElement>('[data-route]').forEach((element) => {
    element.addEventListener("click", () => navigate(element.dataset.route ?? "home"));
  });
  root.querySelectorAll<HTMLElement>("[data-era]").forEach((element) => {
    element.addEventListener("click", () => navigate("briefing"));
  });
}
