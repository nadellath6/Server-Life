import { describe, expect, it } from "vitest";
import { ERAS } from "../data/eras";
import { selectForm } from "./forms";

describe("Stage E1 generated forms", () => {
  it("keeps composition, incident schedule, and distinct type sequences", () => {
    for (const era of [1, 2, 3] as const) {
      const forms = [0, 1, 2].map((form) => selectForm(era, form));
      expect(forms.map((form) => form.packets.length)).toEqual([ERAS[era].packetCount, ERAS[era].packetCount, ERAS[era].packetCount]);
      expect(forms[0].incidentSchedule).toEqual(forms[1].incidentSchedule);
      expect(forms[0].packets.map((packet) => packet.type)).not.toEqual(forms[1].packets.map((packet) => packet.type));
      for (const form of forms) {
        for (let index = 1; index < form.packets.length; index += 1) {
          const previous = form.packets[index - 1];
          const current = form.packets[index];
          expect(current.spawnTime - previous.spawnTime).toBeGreaterThanOrEqual(0.16 * Math.abs(current.lane - previous.lane));
        }
      }
    }
  });
});
