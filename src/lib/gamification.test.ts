import { describe, expect, it } from "vitest";
import { extendStreak, levelFor, liveStreak, previousDay } from "./gamification";

describe("levels", () => {
  it("starts at level 1 and moves up at thresholds", () => {
    expect(levelFor(0).number).toBe(1);
    expect(levelFor(99).number).toBe(1);
    expect(levelFor(100).number).toBe(2);
    expect(levelFor(120).toNext).toBe(130);
    expect(levelFor(1_000_000).next).toBeUndefined();
  });
});

describe("streaks", () => {
  const empty = { current: 0, record: 0, lastDay: null };

  it("handles month boundaries", () => {
    expect(previousDay("2026-11-01")).toBe("2026-10-31");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });

  it("extends on consecutive days and resets after a gap", () => {
    let s = extendStreak(empty, "2026-10-28");
    s = extendStreak(s, "2026-10-29");
    s = extendStreak(s, "2026-10-29");
    expect(s).toEqual({ current: 2, record: 2, lastDay: "2026-10-29" });
    s = extendStreak(s, "2026-11-02");
    expect(s).toEqual({ current: 1, record: 2, lastDay: "2026-11-02" });
  });

  it("shows 0 once a day has been missed", () => {
    const s = { current: 4, record: 4, lastDay: "2026-10-28" };
    expect(liveStreak(s, "2026-10-29")).toBe(4);
    expect(liveStreak(s, "2026-10-30")).toBe(0);
  });
});
