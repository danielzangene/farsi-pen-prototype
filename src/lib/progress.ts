// Numbers for the Progress page: a month calendar of practice days, how each
// sound's score has moved, and a summary of the whole course.

import { GRAMMAR } from "@/content/grammar";
import { LESSONS } from "@/content/lessons";
import { MISSIONS } from "@/content/missions";
import { READINGS } from "@/content/readings";
import { SCENES } from "@/content/scenes";
import { HARD_SOUNDS } from "@/content/sounds";
import { WORDS } from "@/content/words";
import { displayState } from "./mastery";
import { soundPathTotals } from "./sound-path";
import { type ProgressState, wordsLearned } from "./store";

export type DayState = "goal" | "practised" | "none";

export function dayState(s: Pick<ProgressState, "daily" | "activity" | "settings">, key: string): DayState {
  const d = s.daily[key];
  if ((d?.words ?? 0) >= s.settings.dailyGoal) return "goal";
  // A daily record is only made by practising; activity covers saves from before that was true.
  if (d || (s.activity?.[key]?.length ?? 0) > 0) return "practised";
  return "none";
}

/** Weeks (Monday first) of the month containing `month`; days outside the month are null. */
export function monthGrid(month: Date): (Date | null)[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** Each scored sound's history (oldest first) and its change since the first score. */
export function soundTrends(s: Pick<ProgressState, "soundStats" | "soundHistory">) {
  const days = Object.keys(s.soundHistory ?? {}).sort();
  return HARD_SOUNDS.filter((x) => s.soundStats?.[x.id])
    .map((x) => {
      const points = days.filter((d) => s.soundHistory[d]?.[x.id] !== undefined).map((d) => ({ day: d, value: s.soundHistory[d][x.id] }));
      const now = s.soundStats[x.id].avg;
      const first = points[0]?.value ?? now;
      return { sound: x, points, now, change: now - first };
    })
    .sort((a, b) => a.now - b.now);
}

/** The whole course at a glance, area by area (Progress page). */
export function courseProgress(s: ProgressState) {
  const sounds = soundPathTotals(s.soundPath);
  const skills = MISSIONS.flatMap((m) => m.skills);
  return [
    { id: "words", label: "Words learned", have: wordsLearned(s), total: WORDS.length },
    { id: "lessons", label: "Lessons", have: LESSONS.filter((l) => s.lessons[l.id]?.completedAt).length, total: LESSONS.length },
    { id: "sounds", label: "Sound stages", have: sounds.done, total: sounds.total },
    { id: "skills", label: "Mission skills mastered", have: skills.filter((k) => displayState(s.skills[k.id]) === "mastered").length, total: skills.length },
    { id: "grammar", label: "Grammar concepts", have: GRAMMAR.filter((g) => s.grammar[g.id]?.passed).length, total: GRAMMAR.length },
    { id: "reading", label: "Reading lessons", have: READINGS.filter((r) => s.readings?.[r.id]).length, total: READINGS.length },
    { id: "scenes", label: "Scenes played", have: SCENES.filter((x) => s.scenes?.[x.id]).length, total: SCENES.length },
  ];
}
