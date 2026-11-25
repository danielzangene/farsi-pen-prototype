import { describe, expect, it } from "vitest";
import { BADGES, dayKey, earnedBadges, type BadgeStats } from "./gamification";

describe("dayKey", () => {
  it("formats the local date", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("badges", () => {
  const none: BadgeStats = { lessonsDone: 0, totalLessons: 40, level1Done: 0, level1Total: 8, wordsLearned: 0, lettersTraced: 0, totalLetters: 32, grammarDone: 0, totalGrammar: 20 };

  it("earns a badge once its target is reached", () => {
    expect(earnedBadges(none).size).toBe(0);
    const earned = earnedBadges({ ...none, lessonsDone: 1, wordsLearned: 30 });
    expect([...earned].sort()).toEqual(["first-lesson", "words-25"]);
  });

  it("has no XP or streak badges", () => {
    expect(BADGES.some((b) => /^(xp|streak)-/.test(b.id))).toBe(false);
  });
});
