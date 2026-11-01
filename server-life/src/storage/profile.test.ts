import { describe, expect, it } from "vitest";
import { beginSession, completeTutorial, finalizeInterruptedSessions, formIndexForAttempt, loadProfileLog, profileLogKey } from "./profile";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("Stage E1 profile sessions", () => {
  it("uses the incremented attempt in the three-form formula", () => {
    expect(formIndexForAttempt(1, 1, 1)).toBe(2);
    expect(formIndexForAttempt(2, 2, 2)).toBe(2);
    expect(formIndexForAttempt(3, 3, 3)).toBe(2);
  });

  it("isolates profiles and advances attempts through aborted sessions", () => {
    const storage = memoryStorage();
    const first = { kode: "A", nomorUrut: 1 };
    const second = { kode: "B", nomorUrut: 2 };
    const session = beginSession(first, 1, ["cdn"], storage);
    expect(session.attempt).toBe(1);
    expect(session.formIndex).toBe(2);
    expect(loadProfileLog(second, storage).attempt_counter).toBe(0);
    const aborted = finalizeInterruptedSessions(first, "now", storage);
    expect(aborted.sessions[0].status).toBe("ABORTED");
    const next = beginSession(first, 1, [], storage);
    expect(next.attempt).toBe(2);
    expect(loadProfileLog(first, storage).attempt_counter).toBe(2);
    expect(storage.getItem(profileLogKey(second.kode))).toBeNull();
  });

  it("stores the first tutorial result and does not overwrite it on replay", () => {
    const storage = memoryStorage();
    const profile = { kode: "T", nomorUrut: 1 };
    completeTutorial(profile, { score: 3, answers: { CPU: "WEB" }, durationSeconds: 1 }, storage);
    completeTutorial(profile, { score: 1, answers: {}, durationSeconds: 2 }, storage);
    expect(loadProfileLog(profile, storage).tutorial?.quizScore).toBe(3);
  });
});
