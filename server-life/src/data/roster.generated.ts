export type RosterEntry = {
  kode: string;
  nomorUrut: number;
  tokenHash: string;
};

export const ROSTER: readonly RosterEntry[] = Object.freeze([
  { kode: "SAMPLE-01", nomorUrut: 1, tokenHash: "81e4d33012a6fba00d36d24150e503ef88dea35dc1be9271f42ceadfd7e94969" },
  { kode: "SAMPLE-02", nomorUrut: 2, tokenHash: "f92d92bcc58fe39b362944b8af984aaf502cb97fac8e44c9d05477f72977f58b" },
  { kode: "SAMPLE-03", nomorUrut: 3, tokenHash: "ffed540efe2e8453200931e6369779dcff1b4382ef0f0c1d383ea4fff24f49aa" },
]);
