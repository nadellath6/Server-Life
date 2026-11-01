import { GAME } from "../data/constants";

export function createFixedTimestep(step: (deltaSeconds: number) => void) {
  let accumulator = 0;

  return {
    advance(elapsedSeconds: number) {
      accumulator = Math.min(
        GAME.maxAccumulatedDeltaSeconds,
        accumulator + Math.max(0, elapsedSeconds),
      );
      while (accumulator >= GAME.fixedDeltaSeconds) {
        step(GAME.fixedDeltaSeconds);
        accumulator -= GAME.fixedDeltaSeconds;
      }
    },
    reset() {
      accumulator = 0;
    },
  };
}
