export type NodeBranch = "hardware" | "performa" | "keamanan" | "ketahanan";

export type NodeDefinition = {
  id: string;
  branch: NodeBranch;
  title: string;
  prices: readonly number[];
  effect: string;
  tahap: 1 | 2 | 3;
  hardware?: boolean;
  requires?: string;
};

export const NODES: readonly NodeDefinition[] = Object.freeze([
  { id: "cpu", branch: "hardware", title: "CPU", prices: [20, 40], effect: "Kapasitas proses 2→4→8 vCPU.", tahap: 1, hardware: true },
  { id: "ram", branch: "hardware", title: "RAM", prices: [20, 40], effect: "Kapasitas memori 2→4→8 GB.", tahap: 1, hardware: true },
  { id: "bandwidth", branch: "hardware", title: "Bandwidth", prices: [25, 50], effect: "Kapasitas trafik 100→200→500 Mbps.", tahap: 1, hardware: true },
  { id: "storage", branch: "hardware", title: "Storage", prices: [20, 40], effect: "Ruang data 16→32→80 GB.", tahap: 1, hardware: true },
  { id: "query-cache", branch: "performa", title: "Query Cache & Indexing", prices: [25], effect: "Recovery CPU 6→9%/dtk, RAM 3→4%/dtk; beban DATA −25%.", tahap: 1 },
  { id: "cdn", branch: "performa", title: "CDN", prices: [25], effect: "Recovery Bandwidth 2,5→4,0%/dtk.", tahap: 1 },
  { id: "load-balancer", branch: "performa", title: "Load Balancer", prices: [40], effect: "Semua beban paket masuk −20%.", tahap: 2 },
  { id: "autoscaling", branch: "performa", title: "Autoscaling", prices: [50], effect: "Efek autoscaling tersedia pada tahap berikutnya.", tahap: 2 },
  { id: "firewall", branch: "keamanan", title: "Firewall", prices: [30], effect: "Efek Firewall tersedia pada tahap berikutnya.", tahap: 1 },
  { id: "rate-limiting", branch: "keamanan", title: "Rate Limiting", prices: [35], effect: "Efek Rate Limiting tersedia pada tahap berikutnya.", tahap: 1 },
  { id: "antivirus", branch: "keamanan", title: "Antivirus", prices: [30], effect: "Deteksi Ransomware pada detik ke-3; laju enkripsi ×0,50.", tahap: 2 },
  { id: "patch-rutin", branch: "keamanan", title: "Patch Rutin", prices: [35], effect: "Laju enkripsi ×0,60; awal gelombang tertunda 10 detik.", tahap: 2 },
  { id: "cooling", branch: "ketahanan", title: "Pendingin", prices: [30, 50], effect: "Pendingin Lv1/Lv2 mengurangi panas masuk menjadi ×0,70/×0,40.", tahap: 2, hardware: true, requires: "cooling" },
  { id: "backup-local", branch: "ketahanan", title: "Backup Lokal", prices: [40], effect: "System Restore Ransomware dan Auto-Archive Storage.", tahap: 1 },
  { id: "backup-cloud", branch: "ketahanan", title: "Backup Cloud", prices: [60], effect: "Pemulihan Ransomware dan Cloud Offload sebagai failover.", tahap: 3 },
  { id: "ups", branch: "ketahanan", title: "UPS", prices: [25], effect: "Overheating berlangsung 12 detik dengan panas insiden 2,20 C/dtk.", tahap: 3 },
]);

export const FREE_CHOICE_NODE_IDS = Object.freeze(
  NODES.filter((node) => !node.hardware).map((node) => node.id),
);
