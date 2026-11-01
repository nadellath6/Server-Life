import { describe, expect, it } from "vitest";
import { TUTORIAL, tutorialSchedule } from "../data/tutorialScript";
import { createTutorialState, laneFromTap, scoreQuiz, submitQuiz, tutorialOutcomes } from "./tutorial";

describe("Stage F1 tutorial engine", () => {
  it("scores only the first quiz submission from zero through four", () => {
    const answers = { CPU: "WEB", RAM: "DATA", BANDWIDTH: "MEDIA", STORAGE: "UPLOAD" } as const;
    expect(scoreQuiz({})).toBe(0);
    expect(scoreQuiz({ CPU: "DATA" })).toBe(0);
    expect(scoreQuiz(answers)).toBe(4);
    const submitted = submitQuiz({ submitted: false, score: 0, answers: {} }, answers);
    expect(submitted.score).toBe(4);
    expect(submitQuiz(submitted, {}).score).toBe(4);
  });

  it("uses the fixed six-packet script without credits", () => {
    expect(tutorialSchedule()).toEqual(tutorialSchedule());
    expect(tutorialSchedule()).toHaveLength(TUTORIAL.packetCount);
    expect(tutorialOutcomes()).toEqual(["caught", "caught", "caught", "caught", "rejected", "caught"]);
    expect(createTutorialState().credits).toBe(0);
  });

  it("maps canvas thirds to lanes", () => {
    expect(laneFromTap(10, 0, 300)).toBe(0);
    expect(laneFromTap(150, 0, 300)).toBe(1);
    expect(laneFromTap(290, 0, 300)).toBe(2);
  });
});
