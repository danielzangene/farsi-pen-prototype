import { describe, expect, it } from "vitest";
import { GRAMMAR } from "@/content/grammar";
import { LESSONS } from "@/content/lessons";
import { MISSIONS } from "@/content/missions";
import { READINGS } from "@/content/readings";
import { buildPath, nextOnPath } from "./path";
import { DEFAULT_STATE } from "./store";

describe("path", () => {
  const path = buildPath(DEFAULT_STATE);
  const items = path.flatMap((s) => s.items);
  it("covers every lesson, mission, reading and grammar concept exactly once", () => {
    for (const l of LESSONS) expect(items.filter((i) => i.id === `lesson-${l.id}`)).toHaveLength(1);
    for (const g of GRAMMAR) expect(items.filter((i) => i.id === `grammar-${g.id}`)).toHaveLength(1);
    for (const m of MISSIONS) expect(items.filter((i) => i.id === `mission-${m.id}`)).toHaveLength(1);
    for (const r of READINGS) expect(items.filter((i) => i.id === `reading-${r.id}`)).toHaveLength(1);
  });
  it("tags every lesson step with its lesson, for Speak and Hands-free", () => {
    for (const l of LESSONS) expect(items.find((i) => i.id === `lesson-${l.id}`)?.lessonId).toBe(l.id);
    expect(items.filter((i) => i.kind !== "lesson" && i.lessonId)).toHaveLength(0);
  });
  it("numbers sections in order and has unique ids", () => {
    path.forEach((s, i) => expect(s.number).toBe(i + 1));
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });
  it("starts a new learner at the alphabet, then moves on", () => {
    expect(nextOnPath(path)?.item.id).toBe("alphabet");
  });
  it("lets readers skip the alphabet and starts at the placement level", () => {
    const reader = { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings, reads: "yes" as const } };
    expect(nextOnPath(path, reader)?.item.id).toBe("sounds");
    const b1 = { ...DEFAULT_STATE, placement: { level: "B1" as const, at: "", correct: 0, total: 0 } };
    const n = nextOnPath(path, b1);
    expect(["sounds", "reading-big-city"]).toContain(n?.item.id);
  });
});
