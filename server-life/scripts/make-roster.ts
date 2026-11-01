import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROSTER_SALT = "server-life-roster-v1";

const file = process.argv[2];
if (!file) throw new Error("Usage: npm run roster -- roster.csv");
const rows = readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
const entries = rows.filter(Boolean).map((row) => {
  const [kode, nomorUrut, token] = row.split(",").map((value) => value.trim());
  if (!kode || !Number.isInteger(Number(nomorUrut)) || !/^\d{4}$/.test(token ?? "")) throw new Error(`Invalid roster row: ${row}`);
  const tokenHash = createHash("sha256").update(`${ROSTER_SALT}${token}`).digest("hex");
  return { kode, nomorUrut: Number(nomorUrut), tokenHash };
});
writeFileSync("src/data/roster.generated.ts", `export type RosterEntry = { kode: string; nomorUrut: number; tokenHash: string };\nexport const ROSTER: readonly RosterEntry[] = Object.freeze(${JSON.stringify(entries, null, 2)});\n`);
