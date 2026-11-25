import { describe, expect, it } from "vitest";
import { completeGrammar, completeScene, DEFAULT_STATE, exportProgress, importProgress, recordSounds } from "./store";

describe("progress backup", () => {
  it("round-trips through export and import", () => {
    const backup = JSON.stringify({ app: "farsi-pen", progress: { ...DEFAULT_STATE, bookmarks: ["salam"] } });
    expect(importProgress(backup)).toBe(true);
    const out = JSON.parse(exportProgress());
    expect(out.app).toBe("farsi-pen");
    expect(out.progress.bookmarks).toEqual(["salam"]);
  });

  it("imports older backups and drops their XP, streak and retired badges", () => {
    const old = {
      ...DEFAULT_STATE,
      xp: 420,
      streak: { current: 3, record: 9, lastDay: "2026-11-01" },
      daily: { "2026-11-01": { words: 12, xp: 30 } },
      earnedBadges: ["first-lesson", "xp-100", "streak-3"],
    };
    expect(importProgress(JSON.stringify({ app: "farsi-pen", progress: old }))).toBe(true);
    const out = JSON.parse(exportProgress()).progress;
    expect(out).not.toHaveProperty("xp");
    expect(out).not.toHaveProperty("streak");
    expect(out.daily["2026-11-01"]).toEqual({ words: 12 });
    expect(out.earnedBadges).toEqual(["first-lesson"]);
  });

  it("rejects files that aren't a backup", () => {
    expect(importProgress("not json")).toBe(false);
    expect(importProgress(JSON.stringify({ hello: "world" }))).toBe(false);
  });
});

describe("recordSounds", () => {
  it("keeps a running score per sound, one update per take", () => {
    importProgress(JSON.stringify({ app: "farsi-pen", progress: DEFAULT_STATE }));
    recordSounds([{ sound: "kh", score: 100 }, { sound: "kh", score: 0 }, { sound: "r", score: 100 }]);
    recordSounds([{ sound: "kh", score: 100 }]);
    const stats = JSON.parse(exportProgress()).progress.soundStats;
    expect(stats.kh).toMatchObject({ n: 2, avg: 65 });
    expect(stats.r).toMatchObject({ n: 1, avg: 100 });
  });
});

describe("practice days", () => {
  it("records the day for practice that counts no words", () => {
    importProgress(JSON.stringify({ app: "farsi-pen", progress: DEFAULT_STATE }));
    completeGrammar("present-simple", 4, 5);
    const out = JSON.parse(exportProgress()).progress;
    expect(Object.values(out.daily)).toEqual([{ words: 0 }]);
  });
});

describe("completeScene", () => {
  it("keeps the parts played and the best score", () => {
    importProgress(JSON.stringify({ app: "farsi-pen", progress: DEFAULT_STATE }));
    completeScene("welcome", "sara", 4, 5);
    completeScene("welcome", "sara", 5, 5);
    completeScene("welcome", null, 0, 0);
    const rec = JSON.parse(exportProgress()).progress.scenes.welcome;
    expect(rec).toMatchObject({ parts: ["sara"], best: 100, plays: 3 });
  });
});
