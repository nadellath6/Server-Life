import { TUTORIAL, tutorialSchedule } from "../data/tutorialScript";
import type { PacketType } from "../data/constants";
import { createGameState, stepGame, type GameInput, type GameState } from "./state";

export type QuizAnswers = Partial<Record<"CPU" | "RAM" | "BANDWIDTH" | "STORAGE", PacketType>>;
export const QUIZ_PAIRS: Readonly<Record<"CPU" | "RAM" | "BANDWIDTH" | "STORAGE", PacketType>> = Object.freeze({
  CPU: "WEB", RAM: "DATA", BANDWIDTH: "MEDIA", STORAGE: "UPLOAD",
});

export function scoreQuiz(answers: QuizAnswers): number {
  return Object.entries(QUIZ_PAIRS).reduce((score, [resource, packet]) => score + (answers[resource as keyof typeof QUIZ_PAIRS] === packet ? 1 : 0), 0);
}

export type TutorialQuiz = { submitted: boolean; score: number; answers: QuizAnswers };
export function submitQuiz(quiz: TutorialQuiz, answers: QuizAnswers): TutorialQuiz {
  return quiz.submitted ? quiz : { submitted: true, score: scoreQuiz(answers), answers: { ...answers } };
}

export function createTutorialState(): GameState {
  const state = createGameState(tutorialSchedule(), { era: 1 });
  return {
    ...state,
    bars: { ...state.bars, bandwidth: TUTORIAL.presetBandwidth },
    credits: 0,
    telemetry: { ...state.telemetry, packetsServed: 0 },
  };
}

export function stepTutorial(state: GameState, input: GameInput, deltaSeconds: number): GameState {
  const next = stepGame(state, input, deltaSeconds);
  return { ...next, credits: 0, telemetry: { ...next.telemetry, packetsServed: next.telemetry.packetsServed } };
}

export function tutorialOutcomes(): readonly ["caught", "caught", "caught", "caught", "rejected", "caught"] {
  return TUTORIAL.outcomes;
}

export function laneFromTap(clientX: number, left: number, width: number): 0 | 1 | 2 {
  if (width <= 0) return 1;
  const third = width / 3;
  const lane = Math.floor((clientX - left) / third);
  return Math.max(0, Math.min(2, lane)) as 0 | 1 | 2;
}
