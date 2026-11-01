export const C4_CATEGORIES = Object.freeze({
  era2: ["firewall", "rate-limiting", "cdn"],
  era3Cooling: ["pendingin-lv1", "pendingin-lv2", "ups"],
  era3Recovery: ["antivirus", "patch-rutin", "backup-lokal", "backup-cloud"],
  era3Network: ["firewall", "rate-limiting", "cdn"],
});

// Provisional research scoring; the GDD does not define a final formula.
export function provisionalC4Score(era: 2 | 3, nodes: string[]): number {
  const installed = new Set(nodes);
  if (era === 2) return C4_CATEGORIES.era2.some((node) => installed.has(node)) ? 1 : 0;
  return [C4_CATEGORIES.era3Cooling, C4_CATEGORIES.era3Recovery, C4_CATEGORIES.era3Network]
    .filter((category) => category.some((node) => installed.has(node))).length;
}
