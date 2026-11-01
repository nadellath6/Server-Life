import { describe, expect, it } from "vitest";
import { authenticate } from "./auth";

describe("Stage E1 authentication", () => {
  it("accepts the matching token and rejects wrong pairs", async () => {
    await expect(authenticate("SAMPLE-01", "1111")).resolves.toEqual({ kode: "SAMPLE-01", nomorUrut: 1 });
    await expect(authenticate("SAMPLE-01", "2222")).resolves.toBeNull();
    await expect(authenticate("UNKNOWN", "1111")).resolves.toBeNull();
  });
});
