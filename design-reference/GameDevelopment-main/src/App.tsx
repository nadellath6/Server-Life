import { useCallback, useEffect, useRef, useState } from "react";

type Screen = "home" | "briefing" | "run" | "report";
type ResourceKey = "cpu" | "ram" | "bandwidth" | "storage";
type RequestItem = {
  id: number;
  lane: number;
  progress: number;
  kind: ResourceKey;
  heavy?: boolean;
};

const RESOURCE_META: Record<
  ResourceKey,
  { label: string; short: string; color: string; load: number }
> = {
  cpu: { label: "CPU", short: "WEB", color: "#29d6ff", load: 19 },
  ram: { label: "Memory", short: "DATA", color: "#9b7bff", load: 22 },
  bandwidth: { label: "Bandwidth", short: "MEDIA", color: "#ffb84d", load: 25 },
  storage: { label: "Storage", short: "UPLOAD", color: "#4be0a2", load: 21 },
};

const EMPTY_RESOURCES: Record<ResourceKey, number> = {
  cpu: 18,
  ram: 22,
  bandwidth: 12,
  storage: 16,
};

type SkillNode = {
  id: string;
  title: string;
  detail: string;
  price: number;
  icon: "server" | "tree" | "shield" | "book";
  level?: string;
  dependency?: string;
  loanLocked?: boolean;
};

const skillBranches: { name: string; description: string; nodes: SkillNode[] }[] = [
  {
    name: "Hardware",
    description: "Fondasi kapasitas server",
    nodes: [
      { id: "cpu", title: "CPU", level: "Lv1 · Lv2", detail: "+15% / +30% kapasitas proses", price: 450, icon: "server" },
      { id: "ram", title: "RAM", level: "Lv1 · Lv2", detail: "+15% / +30% kapasitas memori", price: 450, icon: "server", dependency: "cpu" },
      { id: "bandwidth", title: "Bandwidth", level: "Lv1 · Lv2", detail: "+15% / +30% trafik masuk", price: 500, icon: "server", dependency: "ram" },
      { id: "storage", title: "Storage", level: "Lv1 · Lv2", detail: "+15% / +30% ruang data", price: 500, icon: "server", dependency: "bandwidth" },
    ],
  },
  {
    name: "Performa",
    description: "Proses request lebih efisien",
    nodes: [
      { id: "cache", title: "Query Cache & Indexing", detail: "Beban query database -18%", price: 600, icon: "tree" },
      { id: "cdn", title: "CDN", detail: "Beban bandwidth statis -20%", price: 700, icon: "tree", dependency: "cache" },
      { id: "load-balancer", title: "Load Balancer", detail: "Sebar beban CPU antar node", price: 850, icon: "tree", dependency: "cdn" },
      { id: "autoscaling", title: "Autoscaling", detail: "Kapasitas naik saat jam sibuk", price: 1100, icon: "tree", dependency: "load-balancer" },
    ],
  },
  {
    name: "Keamanan",
    description: "Redam serangan dan insiden",
    nodes: [
      { id: "firewall", title: "Firewall", detail: "Blokir paket berbahaya dasar", price: 500, icon: "shield" },
      { id: "rate-limit", title: "Rate Limiting", detail: "Dampak DDoS berkurang 25%", price: 650, icon: "shield", dependency: "firewall" },
      { id: "antivirus", title: "Antivirus", detail: "Deteksi ransomware lebih dini", price: 800, icon: "shield", dependency: "rate-limit" },
      { id: "patch", title: "Patch Rutin", detail: "Peluang insiden keamanan -20%", price: 900, icon: "shield", dependency: "antivirus" },
    ],
  },
  {
    name: "Ketahanan",
    description: "Pulih cepat saat kegagalan",
    nodes: [
      { id: "cooling", title: "Pendingin", level: "Lv1 · Lv2", detail: "Laju overheating -20% / -40%", price: 550, icon: "book" },
      { id: "backup-local", title: "Backup Lokal", detail: "Pulihkan satu insiden storage", price: 700, icon: "book", dependency: "cooling" },
      { id: "backup-cloud", title: "Backup Cloud", detail: "Restore data lintas lokasi", price: 950, icon: "book", dependency: "backup-local", loanLocked: true },
      { id: "ups", title: "UPS", detail: "Tahan satu kegagalan daya", price: 1000, icon: "book", dependency: "backup-cloud", loanLocked: true },
    ],
  },
];

const eras = [
  { id: 1, name: "Startup", duration: 120, quota: "28/48 paket", incidents: ["Jam Sibuk"], status: "Terbuka", icon: "server" as const },
  { id: 2, name: "Tumbuh", duration: 150, quota: "45/75 paket", incidents: ["DDoS", "Overheating"], status: "Terkunci", requirement: "Lulus Era 1 · SLA ≥ 85%", icon: "shield" as const },
  { id: 3, name: "Enterprise", duration: 180, quota: "72/120 paket", incidents: ["Ransomware", "Hari Puncak"], status: "Terkunci", requirement: "Lulus Era 2 · 8 node terpasang", icon: "tree" as const },
];

function Icon({
  name,
  size = 20,
}: {
  name: "server" | "home" | "tree" | "book" | "arrow" | "coin" | "lock" | "shield";
  size?: number;
}) {
  const paths = {
    server: (
      <>
        <rect x="4" y="3" width="16" height="7" rx="2" />
        <rect x="4" y="14" width="16" height="7" rx="2" />
        <path d="M8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5" />
      </>
    ),
    home: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    tree: (
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M12 7.5V12M6 15.5V12h12v3.5" />
      </>
    ),
    book: (
      <>
        <path d="M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H4z" />
        <path d="M20 4h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h5z" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    coin: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 8.5c-.6-.5-1.4-.8-2.5-.8-1.5 0-2.7.8-2.7 2s1 1.7 2.8 2.1 2.8.9 2.8 2.2-1.2 2.2-2.9 2.2c-1.2 0-2.2-.4-3-1M12 6v12" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ServerMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand__mark">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand__text">
          SERVER LIFE: <b>RUN TO ENTERPRISE</b>
        </span>
      )}
    </div>
  );
}

function ResourceBar({
  type,
  value,
  compact = false,
}: {
  type: ResourceKey;
  value: number;
  compact?: boolean;
}) {
  const meta = RESOURCE_META[type];
  const state = value >= 85 ? "critical" : value >= 68 ? "warn" : "";
  return (
    <div className={`resource ${compact ? "resource--compact" : ""}`}>
      <div className="resource__label">
        <span>{meta.label}</span>
        <strong className={state}>{Math.round(value)}%</strong>
      </div>
      <div className="resource__track">
        <span
          style={{
            width: `${Math.min(value, 100)}%`,
            background: state === "critical" ? "#ff5263" : meta.color,
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedEra, setSelectedEra] = useState(1);
  const [credits, setCredits] = useState(0);
  const [owned, setOwned] = useState<string[]>(["firewall"]);
  const [lane, setLane] = useState(1);
  const [resources, setResources] = useState(EMPTY_RESOURCES);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [runCredits, setRunCredits] = useState(0);
  const [uptime, setUptime] = useState(100);
  const [timeLeft, setTimeLeft] = useState(45);
  const [logs, setLogs] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const [failedResource, setFailedResource] = useState<ResourceKey | null>(null);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(1);
  const lastSpawn = useRef(0);
  const lastTick = useRef(0);
  const runFinished = useRef(false);

  const capacity = useCallback(
    (key: ResourceKey) => (owned.includes(key) ? 120 : 100),
    [owned],
  );

  const finishRun = useCallback(
    (failure: ResourceKey | null) => {
      if (runFinished.current) return;
      runFinished.current = true;
      setFailedResource(failure);
      setCredits((value) => value + runCredits);
      setScreen("report");
    },
    [runCredits],
  );

  const addLog = useCallback((message: string) => {
    const stamp = new Date().toLocaleTimeString("id-ID", {
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((current) => [`${stamp}  ${message}`, ...current].slice(0, 8));
  }, []);

  const startRun = () => {
    runFinished.current = false;
    setLane(1);
    setResources(EMPTY_RESOURCES);
    setRequests([]);
    setRunCredits(0);
    setUptime(100);
    setTimeLeft(45);
    setFailedResource(null);
    setPaused(false);
    setWarning("");
    setLogs(["00:00  SYS   Server utama aktif", "00:00  INFO  Semua layanan normal"]);
    lastSpawn.current = performance.now();
    lastTick.current = performance.now();
    setScreen("run");
  };

  const move = useCallback((direction: -1 | 1) => {
    setLane((current) => Math.max(0, Math.min(2, current + direction)));
  }, []);

  useEffect(() => {
    if (screen !== "run" || paused) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, paused, screen]);

  useEffect(() => {
    if (screen !== "run" || paused) return;
    const countdown = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.setTimeout(() => finishRun(null), 0);
          return 0;
        }
        if (value === 16) {
          setWarning("TRAFFIC SPIKE TERDETEKSI");
          addLog("WARN  Lonjakan trafik masuk");
          window.setTimeout(() => setWarning(""), 3600);
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [addLog, finishRun, paused, screen]);

  useEffect(() => {
    if (screen !== "run" || paused) return;
    let frame = 0;
    const animate = (now: number) => {
      const delta = Math.min((now - lastTick.current) / 1000, 0.04);
      lastTick.current = now;
      const spawnRate = timeLeft < 15 ? 520 : timeLeft < 28 ? 720 : 920;
      if (now - lastSpawn.current > spawnRate) {
        const keys = Object.keys(RESOURCE_META) as ResourceKey[];
        const kind = keys[Math.floor(Math.random() * keys.length)];
        setRequests((items) => [
          ...items,
          {
            id: nextId.current++,
            lane: Math.floor(Math.random() * 3),
            progress: 0,
            kind,
            heavy: Math.random() > 0.83,
          },
        ]);
        lastSpawn.current = now;
      }

      setRequests((items) => {
        const updated: RequestItem[] = [];
        items.forEach((item) => {
          const progress = item.progress + delta * (timeLeft < 15 ? 28 : 22);
          if (progress >= 84) {
            if (item.lane === lane) {
              const meta = RESOURCE_META[item.kind];
              let load = meta.load * (item.heavy ? 1.45 : 1);
              if (owned.includes("cache") && (item.kind === "cpu" || item.kind === "ram")) {
                load *= 0.65;
              }
              setResources((current) => ({
                ...current,
                [item.kind]: current[item.kind] + load,
              }));
              setRunCredits((value) => value + (item.heavy ? 85 : 45));
              if (item.heavy) addLog(`INFO  ${meta.label} request berat dilayani`);
            } else {
              setUptime((value) => Math.max(0, value - 0.7));
            }
          } else {
            updated.push({ ...item, progress });
          }
        });
        return updated;
      });

      setResources((current) => {
        const next = { ...current };
        (Object.keys(next) as ResourceKey[]).forEach((key) => {
          next[key] = Math.max(5, next[key] - delta * 6.1);
          if (next[key] >= capacity(key)) {
            window.setTimeout(() => finishRun(key), 0);
          }
        });
        return next;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [addLog, capacity, finishRun, lane, owned, paused, screen, timeLeft]);

  const togglePause = () => {
    setPaused((current) => {
      if (current) {
        lastTick.current = performance.now();
        lastSpawn.current = performance.now();
      }
      return !current;
    });
  };

  const buyUpgrade = (id: string, price: number) => {
    if (owned.includes(id) || credits < price) return;
    setOwned((value) => [...value, id]);
    setCredits((value) => value - price);
  };

  const refundUpgrade = (id: string, price: number) => {
    if (!owned.includes(id)) return;
    setOwned((value) => value.filter((item) => item !== id));
    setCredits((value) => value + price);
  };

  return (
    <main className="app-shell">
      <div className="noise" />
      {screen === "home" && (
        <Home
          credits={credits}
          owned={owned}
          buyUpgrade={buyUpgrade}
          refundUpgrade={refundUpgrade}
          onPlay={(era) => {
            setSelectedEra(era);
            setScreen("briefing");
          }}
        />
      )}
      {screen === "briefing" && (
        <Briefing era={selectedEra} onBack={() => setScreen("home")} onStart={startRun} />
      )}
      {screen === "run" && (
        <Game
          era={selectedEra}
          lane={lane}
          resources={resources}
          requests={requests}
          runCredits={runCredits}
          uptime={uptime}
          timeLeft={timeLeft}
          logs={logs}
          warning={warning}
          paused={paused}
          capacities={{
            cpu: capacity("cpu"),
            ram: capacity("ram"),
            bandwidth: capacity("bandwidth"),
            storage: capacity("storage"),
          }}
          move={move}
          onPause={togglePause}
          onExit={() => {
            runFinished.current = true;
            setPaused(false);
            setScreen("home");
          }}
        />
      )}
      {screen === "report" && (
        <Report
          failure={failedResource}
          runCredits={runCredits}
          uptime={uptime}
          onRetry={startRun}
          onHome={() => setScreen("home")}
        />
      )}
    </main>
  );
}

function Home({
  credits,
  owned,
  buyUpgrade,
  refundUpgrade,
  onPlay,
}: {
  credits: number;
  owned: string[];
  buyUpgrade: (id: string, price: number) => void;
  refundUpgrade: (id: string, price: number) => void;
  onPlay: (era: number) => void;
}) {
  return (
    <div className="home-screen">
      <header className="topbar">
        <ServerMark />
        <nav>
          <button className="nav-item active">
            <Icon name="home" /> Beranda
          </button>
          <button className="nav-item" onClick={() => document.getElementById("skill-tree")?.scrollIntoView()}>
            <Icon name="tree" /> Skill tree
          </button>
        </nav>
        <div className="wallet">
          <Icon name="coin" size={18} />
          <span>Credits</span>
          <strong>{credits.toLocaleString("id-ID")}</strong>
        </div>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow"><i /> SYSTEM ONLINE · ERA 01</span>
          <span className="hero__subtitle">TokoKita System Administrator</span>
          <h1>Server Life:<br /><em>Run to Enterprise</em></h1>
          <p>
            Layani request, seimbangkan sumber daya, dan bangun infrastruktur
            yang siap menghadapi apa pun.
          </p>
          <button className="primary-button" onClick={() => onPlay(1)}>
            Mulai perjalanan <Icon name="arrow" />
          </button>
          <div className="control-hint">
            <span><kbd>A</kbd><kbd>D</kbd></span>
            <p><b>Kontrol jalur</b>Gunakan keyboard atau tombol layar</p>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <div className="server-stack">
            <div className="server-glow" />
            {[0, 1, 2].map((rack) => (
              <div className="rack" key={rack}>
                <span className="rack__lights"><i /><i /><i /></span>
                <span className="rack__vents" />
                <b>SL-{rack + 1}0</b>
              </div>
            ))}
          </div>
          <span className="float-card float-card--uptime"><i /> SLA <b>100%</b><small>Game Over &lt; 70%</small></span>
          <span className="float-card float-card--status"><i /> NORMAL · SYSTEM STABLE</span>
        </div>
      </section>

      <section className="era-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PILIH MISI</span>
            <h2>Perjalanan Infrastruktur</h2>
          </div>
          <span className="progress-label">PROGRESS <b>0 / 3 ERA</b></span>
        </div>
        <div className="era-grid">
          {eras.map((era) => {
            const locked = era.status === "Terkunci";
            return (
              <button
                className={`era-card ${locked ? "era-card--locked" : "era-card--active"}`}
                key={era.id}
                onClick={() => !locked && onPlay(era.id)}
                disabled={locked}
              >
                <span className="era-number">0{era.id}</span>
                <span className={`era-status ${locked ? "locked" : ""}`}>
                  <Icon name={locked ? "lock" : "shield"} size={15} /> {era.status}
                </span>
                <span className="era-art"><Icon name={era.icon} size={44} /></span>
                <small>ERA {era.id}</small>
                <h3>{era.name}</h3>
                <div className="era-metrics">
                  <span><small>DURASI</small><b>{era.duration} dtk</b></span>
                  <span><small>TARGET KUOTA</small><b>{era.quota}</b></span>
                </div>
                <div className="incident-list">
                  {era.incidents.map((incident) => <span key={incident}>{incident}</span>)}
                </div>
                <span className={locked ? "unlock-note" : "era-action"}>
                  {locked ? era.requirement : "Pilih Era 1"} {!locked && <Icon name="arrow" size={17} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="skill-section" id="skill-tree">
        <div className="section-heading">
          <div>
            <span className="section-kicker">TINGKATKAN SISTEM</span>
            <h2>Skill Tree</h2>
          </div>
          <p>Bangun fondasi, lalu buka node lanjutan di setiap cabang.</p>
        </div>
        <div className="skill-layout">
          <div className="skill-branches">
            {skillBranches.map((branch) => (
              <div className="skill-branch" key={branch.name}>
                <div className="branch-heading">
                  <span>{branch.name.slice(0, 2).toUpperCase()}</span>
                  <div><h3>{branch.name}</h3><p>{branch.description}</p></div>
                </div>
                <div className="branch-nodes">
                  {branch.nodes.map((node) => {
                    const isOwned = owned.includes(node.id);
                    const dependencyMet = !node.dependency || owned.includes(node.dependency);
                    const isLocked = !dependencyMet || node.loanLocked;
                    const canBuy = !isLocked && credits >= node.price;
                    return (
                      <article className={`skill-node ${isOwned ? "owned" : ""} ${isLocked ? "locked" : ""}`} key={node.id}>
                        <span className="node-icon"><Icon name={node.icon} size={18} /></span>
                        <div className="node-copy">
                          <span className="node-state">
                            <i /> {isOwned ? "Terpasang" : node.loanLocked ? "[PINJAMAN TERKUNCI]" : isLocked ? "Terkunci" : "Tersedia"}
                          </span>
                          <h4>{node.title} {node.level && <small>{node.level}</small>}</h4>
                          <p>{node.detail}</p>
                        </div>
                        <div className="node-action">
                          <span><Icon name="coin" size={14} /> {node.price}</span>
                          {isOwned ? (
                            <button onClick={() => refundUpgrade(node.id, node.price)}>Refund</button>
                          ) : (
                            <button disabled={!canBuy} onClick={() => buyUpgrade(node.id, node.price)}>
                              {isLocked ? <Icon name="lock" size={14} /> : "Pasang"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <aside className="requirements-panel">
            <span className="section-kicker">PROGRESS ERA 01</span>
            <h3>Syarat Era Berikutnya</h3>
            <p>Lengkapi fondasi Startup untuk membuka Era Tumbuh.</p>
            <div className="requirement-list">
              <span className="done"><i>✓</i><b>Hardware dasar terkunci</b><small>CPU, RAM, Bandwidth, Storage</small></span>
              <span><i>1</i><b>Slot node pilihan</b><small>{owned.length}/1 node terpasang</small></span>
              <span><i>2</i><b>Target operasional</b><small>SLA minimum 85%</small></span>
            </div>
            <div className="status-key">
              <span className="normal"><i>✓</i> Normal</span>
              <span className="warning"><i>!</i> Waspada</span>
              <span className="critical"><i>!</i> Kritis</span>
              <span className="overload"><i>×</i> Overload</span>
            </div>
            <button className="primary-button" onClick={() => onPlay(1)}>Mulai Era 1 <Icon name="arrow" /></button>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Briefing({ era, onBack, onStart }: { era: number; onBack: () => void; onStart: () => void }) {
  const briefings = {
    1: {
      title: "Server pertamamu aktif.",
      text: "Setiap request membebani resource yang berbeda. Ambil request untuk mendapat credits, tetapi jangan biarkan satu bar pun mencapai batas.",
      tip: "Request yang tidak diambil menurunkan uptime. Prioritaskan keseimbangan, bukan hanya jumlah credits.",
    },
    2: {
      title: "Layananmu mulai dikenal.",
      text: "Trafik meningkat dan ancaman keamanan mulai muncul. Jaga performa server sambil menghadapi gelombang request yang lebih agresif.",
      tip: "Firewall, cache, dan kapasitas yang seimbang akan membantu menghadapi lonjakan trafik.",
    },
    3: {
      title: "Waktunya skala besar.",
      text: "Sistem memasuki operasi kritis. Pertahankan layanan saat beban tinggi dan siapkan infrastruktur menghadapi kegagalan.",
      tip: "Tidak ada satu upgrade yang menyelesaikan semuanya. Bangun sistem yang kuat di setiap resource.",
    },
  }[era as 1 | 2 | 3];
  return (
    <div className="briefing-screen">
      <button className="back-button" onClick={onBack}>← Kembali</button>
      <div className="briefing-card">
        <span className="briefing-step">ERA 0{era} · BRIEFING</span>
        <div className="briefing-icon"><Icon name="book" size={34} /></div>
        <h1>{briefings.title}</h1>
        <p>{briefings.text}</p>
        <div className="request-legend">
          {(Object.keys(RESOURCE_META) as ResourceKey[]).map((key) => (
            <span key={key} style={{ "--accent": RESOURCE_META[key].color } as React.CSSProperties}>
              <i>{RESOURCE_META[key].short.slice(0, 1)}</i>
              <b>{RESOURCE_META[key].label}</b>
            </span>
          ))}
        </div>
        <div className="briefing-tip">
          <b>Tips operator</b>
          {briefings.tip}
        </div>
        <button className="primary-button" onClick={onStart}>Nyalakan server <Icon name="arrow" /></button>
      </div>
    </div>
  );
}

function Game({
  era,
  lane,
  resources,
  requests,
  runCredits,
  uptime,
  timeLeft,
  logs,
  warning,
  paused,
  capacities,
  move,
  onPause,
  onExit,
}: {
  era: number;
  lane: number;
  resources: Record<ResourceKey, number>;
  requests: RequestItem[];
  runCredits: number;
  uptime: number;
  timeLeft: number;
  logs: string[];
  warning: string;
  paused: boolean;
  capacities: Record<ResourceKey, number>;
  move: (direction: -1 | 1) => void;
  onPause: () => void;
  onExit: () => void;
}) {
  return (
    <div className="game-screen">
      <header className="game-header">
        <ServerMark />
        <div className="mission-title">
          <span>ERA 0{era}</span>
          <b>{era === 1 ? "BOOT SEQUENCE" : era === 2 ? "THREAT SURGE" : "PEAK LOAD"}</b>
        </div>
        <div className="game-timer"><small>FINISH</small><b>00:{String(timeLeft).padStart(2, "0")}</b></div>
        <button className="pause-button" onClick={onPause} aria-label={paused ? "Lanjutkan game" : "Pause game"}>
          <span className={paused ? "play-symbol" : "pause-symbol"} />
          {paused ? "Lanjut" : "Pause"}
        </button>
        <button className="exit-button" onClick={onExit}>Keluar</button>
      </header>
      <div className="game-layout">
        <aside className="telemetry panel">
          <div className="panel-title"><span>SYSTEM LOAD</span><i>LIVE</i></div>
          {(Object.keys(resources) as ResourceKey[]).map((key) => (
            <div key={key}>
              <ResourceBar type={key} value={(resources[key] / capacities[key]) * 100} />
              <small className="capacity-note">{Math.round(resources[key])} / {capacities[key]} unit</small>
            </div>
          ))}
          <div className="telemetry-grid">
            <span><small>UPTIME</small><b>{uptime.toFixed(1)}%</b></span>
            <span><small>REVENUE</small><b>{runCredits}</b></span>
          </div>
          <div className="temperature">
            <span>CORE TEMP</span><b>48°C</b>
          </div>
        </aside>

        <section className="runner">
          <div className="horizon">
            <span>DATA CENTER / SECTOR 01</span>
          </div>
          {warning && <div className="warning-banner"><i /> {warning} <i /></div>}
          <div className="lane-labels"><span>NODE A</span><span>NODE B</span><span>NODE C</span></div>
          <div className="road">
            <div className="road-grid" />
            <div className="lane-divider lane-divider--left" />
            <div className="lane-divider lane-divider--right" />
            {requests.map((request) => {
              const meta = RESOURCE_META[request.kind];
              return (
                <div
                  className={`request-box ${request.heavy ? "request-box--heavy" : ""}`}
                  key={request.id}
                  style={{
                    "--lane": request.lane,
                    "--progress": request.progress,
                    "--color": meta.color,
                  } as React.CSSProperties}
                >
                  <small>{request.heavy ? "HEAVY" : "REQUEST"}</small>
                  <b>{meta.short}</b>
                  <span>+{request.heavy ? 85 : 45}</span>
                </div>
              );
            })}
            <div className="player" style={{ "--player-lane": lane } as React.CSSProperties}>
              <span className="player-beam" />
              <span className="player-server"><i /><i /><i /></span>
              <small>MAIN SERVER</small>
            </div>
          </div>
          <div className="touch-controls">
            <button onClick={() => move(-1)} aria-label="Pindah ke kiri">←</button>
            <span><kbd>A</kbd><kbd>D</kbd><small>PINDAH JALUR</small></span>
            <button onClick={() => move(1)} aria-label="Pindah ke kanan">→</button>
          </div>
        </section>

        <aside className="console panel">
          <div className="panel-title"><span>SERVER LOG</span><i>STREAM</i></div>
          <div className="log-list">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`} className={log.includes("WARN") ? "warn" : ""}>{log}</p>
            ))}
          </div>
          <div className="objective">
            <span>MISSION OBJECTIVE</span>
            <p><i className={uptime >= 70 ? "checked" : ""} /> Pertahankan uptime 70%</p>
            <p><i /> Seimbangkan semua resource</p>
            <p><i /> Bertahan hingga finis</p>
          </div>
          <div className="next-event">
            <small>NEXT EVENT</small>
            <b>{timeLeft > 15 ? "Jam sibuk" : "Puncak trafik aktif"}</b>
            <span>{timeLeft > 15 ? `T-${timeLeft - 15} detik` : "SEDANG BERLANGSUNG"}</span>
          </div>
        </aside>
      </div>
      {paused && (
        <div className="pause-overlay">
          <div className="pause-card">
            <span className="pause-card__icon"><i /><i /></span>
            <span className="briefing-step">SYSTEM HOLD</span>
            <h2>Game dijeda</h2>
            <p>Timer dan seluruh aktivitas server dihentikan sementara.</p>
            <button className="primary-button" onClick={onPause}>
              Lanjutkan game <span className="play-symbol" />
            </button>
            <button className="pause-exit" onClick={onExit}>Keluar ke beranda</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Report({
  failure,
  runCredits,
  uptime,
  onRetry,
  onHome,
}: {
  failure: ResourceKey | null;
  runCredits: number;
  uptime: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  const success = !failure && uptime >= 70;
  const meta = failure ? RESOURCE_META[failure] : null;
  return (
    <div className="report-screen">
      <div className={`report-card ${success ? "success" : ""}`}>
        <div className="report-top">
          <span className="report-icon">{success ? "✓" : "!"}</span>
          <span className="report-label">{success ? "MISSION COMPLETE" : "INCIDENT REPORT"}</span>
          <h1>{success ? "Server tetap online." : `${meta?.label ?? "Uptime"} mengalami kegagalan.`}</h1>
          <p>
            {success
              ? "Kamu berhasil melewati jam sibuk dan menjaga layanan tetap tersedia."
              : failure
                ? `Beban ${meta?.label.toLowerCase()} melampaui kapasitas server utama.`
                : "Terlalu banyak request tidak terlayani selama perjalanan."}
          </p>
        </div>
        <div className="report-stats">
          <span><small>UPTIME</small><b>{uptime.toFixed(1)}%</b></span>
          <span><small>CREDITS</small><b>+{runCredits}</b></span>
          <span><small>STATUS</small><b>{success ? "STABLE" : "OFFLINE"}</b></span>
        </div>
        <div className="report-detail">
          <span><b>01</b><p><small>APA YANG TERJADI</small>{success ? "Misi selesai tanpa insiden fatal." : `${meta?.label ?? "Uptime"} mencapai batas kritis.`}</p></span>
          <span><b>02</b><p><small>SOLUSI</small>{failure ? `Upgrade kapasitas ${meta?.label} atau hindari request sejenis saat beban tinggi.` : "Layani lebih banyak request untuk mempertahankan uptime."}</p></span>
          <span><b>03</b><p><small>DI DUNIA NYATA</small>Bottleneck terkecil menentukan kapasitas keseluruhan sistem.</p></span>
        </div>
        <div className="report-actions">
          <button className="secondary-button" onClick={onHome}>Kembali ke beranda</button>
          <button className="primary-button" onClick={onRetry}>Coba lagi <Icon name="arrow" /></button>
        </div>
      </div>
    </div>
  );
}
