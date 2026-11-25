"use client";
// Progress store. Everything lives in localStorage under one key and stays on
// this device; only Settings follow a signed-in learner (profile-sync.ts).
// Fields marked "retired" are no longer read but stay, so saved progress,
// backup files and older copies of the app keep the same shape. XP and the day
// streak are gone (flames replace them, on the Supabase profile: flame.ts);
// normalise() drops them from older saves and backups.

import { useSyncExternalStore } from "react";
import { LESSONS } from "@/content/lessons";
import { LETTERS, TRACE_PASS } from "@/content/alphabet";
import { GRAMMAR } from "@/content/grammar";
import { BADGES, dayKey, earnedBadges, type BadgeStats } from "./gamification";
import { STORAGE_KEY } from "./util";
import { gradeFor, isLearned, review, type StoredCard } from "./srs";
import { DEFAULT_PIPER_VOICE, type PiperVoiceId } from "./tts";
import type { EnginePref } from "./stt";
import { applyEvidence, isMastered, type SkillRecord } from "./mastery";
import type { Evidence, MissionStatus } from "./missions";

export type Direction = "fa-en" | "en-fa";
export type Outcome = "good" | "hard" | "again";
export type Theme = "system" | "light" | "dark";

/** Longest name the learner can have (the profiles.name column allows the same). */
export const NAME_MAX_LENGTH = 255;

export interface Settings {
  name: string;
  /** Profile picture URL (the Google photo, from the Supabase profile), or null to show the initial. */
  avatarUrl: string | null;
  dailyGoal: number;
  direction: Direction;
  /** Which writing leads on cards: transliteration or Persian script. */
  script: "latin" | "farsi";
  /** Hide transliteration entirely (reading practice). */
  scriptOnly: boolean;
  showKeyboard: boolean;
  /** Retired: the Home "Getting started" checklist is gone (still synced as profiles.checklist_hidden). */
  checklistHidden: boolean;
  /** Dark by default; "system" follows the device setting. */
  theme: Theme;
  /** Natural (Piper) Persian voice used once downloaded. */
  voice: PiperVoiceId;
  /** Speech recognition engine for speaking practice. */
  speechEngine: EnginePref;
  /** Onboarding answers: why they're learning and whether they read Persian script. */
  goal: Goal | null;
  reads: Reads | null;
  onboarded: boolean;
  /** Retired: the backup suggestion is gone. */
  backupNudge: string | null;
  /** Daily reminder time ("HH:MM"), or null when off. */
  reminder: string | null;
  /** Last day a reminder notification was shown, so it fires once a day. */
  remindedOn: string | null;
}

export type Goal = "travel" | "family" | "heritage" | "curious";
export type Reads = "yes" | "some" | "no";
/** Kinds of practice logged per day; any entry marks the day as practised. */
export type ActivityKind = "review" | "lesson" | "mission" | "grammar" | "alphabet" | "speak" | "reading";

export interface ProgressState {
  version: 1;
  lessons: Record<string, { best: number; attempts: number; completedAt?: string }>;
  cards: Record<string, StoredCard>;
  bookmarks: string[];
  hidden: string[];
  daily: Record<string, DayRecord>;
  grammar: Record<string, { best: number; passed: boolean }>;
  traced: Record<string, number>;
  /** Retired: Daily Practice is gone. */
  practiceSessions: number;
  earnedBadges: string[];
  settings: Settings;
  /** Real-world skills (missions) and their mastery state. */
  skills: Record<string, SkillRecord>;
  missions: Record<string, MissionRecord>;
  /** What was practised each day (dayKey → kinds), last 30 days. */
  activity: Record<string, ActivityKind[]>;
  /** Words the learner added from the dictionary (id → entry). */
  customWords: Record<string, CustomWord>;
  /** How each Persian sound has gone when speaking (sound id → running score). */
  soundStats: Record<string, SoundStat>;
  /** Scenes played (scene id → parts played and best score). */
  scenes: Record<string, SceneRecord>;
  /** Reading lessons (id → best comprehension score and when finished). */
  readings: Record<string, { best: number; doneAt: string }>;
  /** The sound path (unit id → stars per stage, tested out). */
  soundPath: Record<string, SoundPathRecord>;
  /** Each sound's running score at the end of each day (dayKey → sound → score), last 120 days. */
  soundHistory: Record<string, Record<string, number>>;
  /** Result of the placement test, if taken. */
  placement: { level: "A0" | "A1" | "A2" | "B1" | "B2"; at: string; correct: number; total: number } | null;
  /** SAMFA practice: mini mock results (newest last) and practice counts per skill. */
  samfa: { mocks: SamfaMock[]; practised: Record<string, number> };
}

export interface SamfaMock {
  at: string;
  scores: { listening: number; reading: number; writing: number; speaking: number };
  total: number;
}

export interface DayRecord {
  words: number;
  /** Takes spoken into the mic today. */
  spoken?: number;
  /** Retired: daily quests are gone. */
  quests?: string[];
}

export interface SoundPathRecord {
  /** Stars (1–3) per stage played, in order; the last stage is the review. */
  stars: number[];
  testedOut?: boolean;
  /** 0–100 per word, from its latest take, for the review. */
  wordScores?: Record<string, number>;
}

export interface SceneRecord {
  /** Characters played at least once. */
  parts: string[];
  /** Best share of your lines said well, 0–100. */
  best: number;
  plays: number;
  last: string;
}

export interface SoundStat {
  /** Times scored. */
  n: number;
  /** Running score 0–100, recent takes weigh most. */
  avg: number;
  last: string;
}

export interface CustomWord {
  fa: string;
  en: string;
  tr?: string;
  /** [english, persian] */
  example?: [string, string];
  addedAt: string;
}

export interface MissionRecord {
  status: MissionStatus;
  attempts: number;
  best: number;
  lastPlayed: string;
  masteredAt?: string;
}

const KEY = STORAGE_KEY;

export const DEFAULT_STATE: ProgressState = {
  version: 1,
  lessons: {},
  cards: {},
  bookmarks: [],
  hidden: [],
  daily: {},
  grammar: {},
  traced: {},
  practiceSessions: 0,
  earnedBadges: [],
  skills: {},
  missions: {},
  activity: {},
  customWords: {},
  soundStats: {},
  scenes: {},
  readings: {},
  soundPath: {},
  soundHistory: {},
  placement: null,
  samfa: { mocks: [], practised: {} },
  settings: {
    name: "",
    avatarUrl: null,
    dailyGoal: 10,
    direction: "fa-en",
    script: "latin",
    scriptOnly: false,
    showKeyboard: true,
    checklistHidden: false,
    theme: "dark",
    voice: DEFAULT_PIPER_VOICE,
    speechEngine: "auto",
    goal: null,
    reads: null,
    onboarded: false,
    backupNudge: null,
    reminder: null,
    remindedOn: null,
  },
};

let state: ProgressState | null = null;
const listeners = new Set<() => void>();

const BADGE_IDS = new Set(BADGES.map((b) => b.id));

/**
 * Saved progress (from this browser or a backup file) on today's defaults. Drops what older versions kept
 * and this one doesn't: total XP and the streak, XP per day, and badges that no longer exist.
 */
function normalise(saved: Partial<ProgressState>): ProgressState {
  const { xp: _xp, streak: _streak, ...rest } = saved as Partial<ProgressState> & { xp?: unknown; streak?: unknown };
  const daily: Record<string, DayRecord> = {};
  for (const [key, day] of Object.entries(rest.daily ?? {})) {
    const { xp: _dayXp, ...kept } = day as DayRecord & { xp?: unknown };
    daily[key] = kept;
  }
  return {
    ...DEFAULT_STATE,
    ...rest,
    daily,
    earnedBadges: (rest.earnedBadges ?? []).filter((id) => BADGE_IDS.has(id)),
    settings: { ...DEFAULT_STATE.settings, ...rest.settings },
  };
}

function load(): ProgressState {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = normalise(raw ? (JSON.parse(raw) as Partial<ProgressState>) : {});
  } catch {
    state = DEFAULT_STATE;
  }
  return state;
}

function save(next: ProgressState) {
  state = next;
  applyTheme(next.settings.theme);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: progress stays in memory for this visit.
  }
  listeners.forEach((l) => l());
}

/** Set <html data-theme>; "system" removes it so the CSS media query decides. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

/** Called after every local save (used by device sync). */
export function onSave(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The current saved progress. */
export function currentProgress(): ProgressState {
  return load();
}

function update(fn: (s: ProgressState) => ProgressState) {
  save(withBadges(fn(load())));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Progress state; the defaults during server render and hydration. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_STATE);
}

/** True once the client has loaded saved progress (false during prerender). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

// ── Derived values ─────────────────────────────────────────────────────────

export function wordsLearned(s: ProgressState): number {
  return Object.values(s.cards).filter(isLearned).length;
}

export function today(s: ProgressState) {
  return s.daily[dayKey()] ?? { words: 0 };
}

/** Whether anything was ever practised (a lesson, review or any other activity on record). */
export function practisedBefore(s: ProgressState): boolean {
  return Object.keys(s.activity ?? {}).length > 0 || Object.values(s.daily).some((d) => d.words > 0) || Object.keys(s.lessons).length > 0;
}

/** Whether anything was practised today (any activity logged, or words counted toward the daily goal). */
export function practisedToday(s: ProgressState): boolean {
  return (s.activity?.[dayKey()]?.length ?? 0) > 0 || today(s).words > 0;
}

export function badgeStats(s: ProgressState): BadgeStats {
  return {
    lessonsDone: LESSONS.filter((l) => s.lessons[l.id]?.completedAt).length,
    totalLessons: LESSONS.length,
    level1Done: LESSONS.filter((l) => l.level === 1 && s.lessons[l.id]?.completedAt).length,
    level1Total: LESSONS.filter((l) => l.level === 1).length,
    wordsLearned: wordsLearned(s),
    lettersTraced: LETTERS.filter((l) => (s.traced[l.id] ?? 0) >= TRACE_PASS).length,
    totalLetters: LETTERS.length,
    grammarDone: GRAMMAR.filter((g) => s.grammar[g.id]?.passed).length,
    totalGrammar: GRAMMAR.length,
  };
}


function withBadges(s: ProgressState): ProgressState {
  const earned = earnedBadges(badgeStats(s));
  // Badges are kept once earned.
  const merged = Array.from(new Set([...s.earnedBadges, ...earned]));
  return merged.length === s.earnedBadges.length ? s : { ...s, earnedBadges: merged };
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * Logs a kind of practice for today (kept for 30 days). Today also gets a daily record, which stays
 * after the 30 days and marks the day as practised for good.
 */
function logActivity(s: ProgressState, kind: ActivityKind): ProgressState {
  const key = dayKey();
  if (!s.daily[key]) s = { ...s, daily: { ...s.daily, [key]: { words: 0 } } };
  const day = s.activity?.[key] ?? [];
  if (day.includes(kind)) return s;
  const keep = Object.keys(s.activity ?? {}).sort().slice(-29);
  const activity: Record<string, ActivityKind[]> = {};
  for (const k of keep) activity[k] = s.activity[k];
  activity[key] = [...day, kind];
  return { ...s, activity };
}

export function markActivity(kind: ActivityKind) {
  update((s) => logActivity(s, kind));
}

/** Counts `words` toward today's daily goal. */
function addWords(s: ProgressState, words: number): ProgressState {
  if (!words) return s;
  const key = dayKey();
  const day = s.daily[key] ?? { words: 0 };
  return { ...s, daily: { ...s.daily, [key]: { ...day, words: day.words + words } } };
}

function reviewAll(cards: Record<string, StoredCard>, outcomes: Record<string, Outcome>) {
  const next = { ...cards };
  for (const [id, o] of Object.entries(outcomes)) next[id] = review(cards[id], gradeFor(o));
  return next;
}

export interface SessionSummary {
  correct: number;
  total: number;
  outcomes: Record<string, Outcome>;
}

export function completeLesson(lessonId: string, r: SessionSummary) {
  const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
  update((s) => {
    const prev = s.lessons[lessonId];
    const next: ProgressState = {
      ...s,
      cards: reviewAll(s.cards, r.outcomes),
      lessons: {
        ...s.lessons,
        [lessonId]: {
          best: Math.max(prev?.best ?? 0, pct),
          attempts: (prev?.attempts ?? 0) + 1,
          completedAt: prev?.completedAt ?? new Date().toISOString(),
        },
      },
    };
    return logActivity(addWords(next, Object.keys(r.outcomes).length), "lesson");
  });
}

export function completePractice(r: SessionSummary) {
  update((s) =>
    logActivity(
      addWords({ ...s, cards: reviewAll(s.cards, r.outcomes), practiceSessions: s.practiceSessions + 1 }, Object.keys(r.outcomes).length),
      "review",
    ),
  );
}

/**
 * Records a mission session. Every answer is evidence for its skill. When the
 * whole mission is mastered its vocabulary joins spaced review.
 */
export function completeMission(
  missionId: string,
  evidence: Evidence[],
  result: { status: MissionStatus; score: number } | null,
  wordIds: string[] = [],
) {
  update((s) => {
    const now = new Date();
    const skills = { ...s.skills };
    for (const e of evidence) skills[e.skill] = applyEvidence(skills[e.skill], e.context, e.ok, now);
    let next: ProgressState = { ...s, skills };
    if (result) {
      const prev = s.missions[missionId];
      const mastered = result.status === "mastered";
      next.missions = {
        ...s.missions,
        [missionId]: {
          status: result.status,
          attempts: (prev?.attempts ?? 0) + 1,
          best: Math.max(prev?.best ?? 0, result.score),
          lastPlayed: now.toISOString(),
          masteredAt: prev?.masteredAt ?? (mastered ? now.toISOString() : undefined),
        },
      };
      if (mastered && !prev?.masteredAt) {
        const cards = { ...next.cards };
        for (const id of wordIds) if (!cards[id]) cards[id] = review(undefined, gradeFor("good"), now);
        next = { ...next, cards };
      }
    }
    return logActivity(next, "mission");
  });
}

export function skillMastered(s: ProgressState, skillId: string): boolean {
  return isMastered(s.skills[skillId]);
}

/**
 * Flashcard session: every first rating updates the word's FSRS card. Only
 * words that were due or new count toward the daily goal, so re-running a deck
 * doesn't fill it.
 */
export function completeFlashcards(outcomes: Record<string, Outcome>, eligible: Set<string>) {
  update((s) => logActivity(addWords({ ...s, cards: reviewAll(s.cards, outcomes) }, Object.keys(outcomes).filter((id) => eligible.has(id)).length), "review"));
}

/** Speaking practice: every word tried counts toward the daily goal. */
export function completeSpeaking(r: SessionSummary) {
  update((s) => logActivity(addWords(s, Object.keys(r.outcomes).length), "speak"));
}

/** A scene played as `part` (or just listened to, part = null). */
export function completeScene(sceneId: string, part: string | null, good: number, total: number) {
  update((s) => {
    const prev = s.scenes?.[sceneId];
    const parts = prev?.parts ?? [];
    const newPart = !!part && !parts.includes(part);
    const score = total ? Math.round((good / total) * 100) : 0;
    const rec: SceneRecord = { parts: newPart ? [...parts, part!] : parts, best: Math.max(prev?.best ?? 0, part ? score : 0), plays: (prev?.plays ?? 0) + 1, last: dayKey() };
    const next = { ...s, scenes: { ...(s.scenes ?? {}), [sceneId]: rec } };
    return part ? logActivity(next, "speak") : next;
  });
}

/** A hands-free session with `items` heard and repeated. */
export function completeHandsFree(items: number) {
  if (items > 0) markActivity("speak");
}

/** A finished reading lesson: the best comprehension score and the day it was first finished. */
export function completeReading(id: string, correct: number, total: number) {
  update((s) => {
    const prev = s.readings?.[id];
    const best = Math.max(prev?.best ?? 0, total ? Math.round((correct / total) * 100) : 0);
    return logActivity({ ...s, readings: { ...(s.readings ?? {}), [id]: { best, doneAt: prev?.doneAt ?? dayKey() } } }, "reading");
  });
}

/**
 * A stage of the sound path (or its test-out). `stage` is the stage index,
 * or "test"; `passed` says whether the test was passed.
 */
export function completeSoundStage(unitId: string, stage: number | "test", outcomes: Record<string, Outcome>, stars: number, passed = false) {
  update((s) => {
    const prev = s.soundPath?.[unitId] ?? { stars: [] };
    const wordScores = { ...(prev.wordScores ?? {}) };
    for (const [id, o] of Object.entries(outcomes)) wordScores[id] = o === "good" ? 100 : o === "hard" ? 60 : 20;
    let rec: SoundPathRecord = { ...prev, wordScores };
    if (stage === "test") {
      if (passed) rec = { ...rec, testedOut: true };
    } else {
      const starsList = [...prev.stars];
      starsList[stage] = Math.max(starsList[stage] ?? 0, stars);
      rec = { ...rec, stars: starsList };
    }
    return logActivity({ ...s, soundPath: { ...(s.soundPath ?? {}), [unitId]: rec } }, "speak");
  });
}

export function savePlacement(level: NonNullable<ProgressState["placement"]>["level"], correct: number, total: number) {
  update((s) => logActivity({ ...s, placement: { level, at: dayKey(), correct, total } }, "lesson"));
}

/** One SAMFA practice task (skill = listening/reading/writing/speaking). */
export function completeSamfaPractice(skill: string) {
  update((s) => {
    const prev = s.samfa ?? { mocks: [], practised: {} };
    const next = { ...s, samfa: { ...prev, practised: { ...prev.practised, [skill]: (prev.practised[skill] ?? 0) + 1 } } };
    return logActivity(next, "reading");
  });
}

export function saveSamfaMock(scores: SamfaMock["scores"]) {
  const total = scores.listening + scores.reading + scores.writing + scores.speaking;
  update((s) => {
    const prev = s.samfa ?? { mocks: [], practised: {} };
    return logActivity({ ...s, samfa: { ...prev, mocks: [...prev.mocks, { at: dayKey(), scores, total }].slice(-20) } }, "reading");
  });
}

export function completeGrammar(id: string, correct: number, total: number) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  update((s) => {
    const prev = s.grammar[id];
    return logActivity({ ...s, grammar: { ...s.grammar, [id]: { best: Math.max(prev?.best ?? 0, pct), passed: !!prev?.passed || pct >= 80 } } }, "grammar");
  });
}

/** Records a tracing score (0–100); the best one per letter is kept. */
export function recordTrace(letterId: string, score: number) {
  update((s) => {
    const prev = s.traced[letterId] ?? 0;
    return logActivity({ ...s, traced: { ...s.traced, [letterId]: Math.max(prev, score) } }, "alphabet");
  });
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Folds one spoken take's per-sound scores into the learner's sound stats. */
export function recordSounds(scores: { sound: string; score: number }[]) {
  if (!scores.length) return;
  update((s) => {
    const stats = { ...(s.soundStats ?? {}) };
    const at = dayKey();
    // One update per sound per take (average its letters).
    const take = new Map<string, number[]>();
    for (const { sound, score } of scores) take.set(sound, [...(take.get(sound) ?? []), score]);
    take.forEach((xs, id) => {
      const score = xs.reduce((a, b) => a + b, 0) / xs.length;
      const prev = stats[id];
      stats[id] = prev ? { n: prev.n + 1, avg: Math.round(prev.avg * 0.7 + score * 0.3), last: at } : { n: 1, avg: Math.round(score), last: at };
    });
    const key = dayKey();
    const day = s.daily[key] ?? { words: 0 };
    const history: Record<string, Record<string, number>> = {};
    for (const k of Object.keys(s.soundHistory ?? {}).sort().slice(-119)) history[k] = s.soundHistory[k];
    const todayScores = { ...(history[key] ?? {}) };
    take.forEach((_, id) => (todayScores[id] = stats[id].avg));
    history[key] = todayScores;
    return { ...s, soundStats: stats, soundHistory: history, daily: { ...s.daily, [key]: { ...day, spoken: (day.spoken ?? 0) + 1 } } };
  });
}

/** Adds a dictionary word to My cards (and returns its id). */
export function addCustomWord(w: Omit<CustomWord, "addedAt">): string {
  const id = `custom:${w.fa.replace(/\s+/g, "-")}`;
  update((s) => ({
    ...s,
    customWords: { ...s.customWords, [id]: { ...w, addedAt: s.customWords?.[id]?.addedAt ?? new Date().toISOString() } },
    bookmarks: s.bookmarks.includes(id) ? s.bookmarks : [...s.bookmarks, id],
  }));
  return id;
}

export function toggleBookmark(wordId: string) {
  update((s) => ({ ...s, bookmarks: toggle(s.bookmarks, wordId) }));
}

export function toggleHidden(wordId: string) {
  update((s) => ({ ...s, hidden: toggle(s.hidden, wordId) }));
}

/** Current settings outside React (falls back to defaults on the server). */
export function getSettings(): Settings {
  return typeof window === "undefined" ? DEFAULT_STATE.settings : load().settings;
}

export function updateSettings(patch: Partial<Settings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

/** The whole progress as a JSON file's contents, for backup or moving devices. */
export function exportProgress(): string {
  return JSON.stringify({ app: "farsi-pen", exportedAt: new Date().toISOString(), progress: load() }, null, 2);
}

/** Replaces progress with an exported file. Returns false if the file isn't a Farsi Pen backup. */
export function importProgress(text: string): boolean {
  try {
    const data = JSON.parse(text) as { app?: string; progress?: Partial<ProgressState> };
    const p = data.app === "farsi-pen" ? data.progress : (data as Partial<ProgressState>);
    if (!p || p.version !== 1 || typeof p.cards !== "object" || p.cards === null) return false;
    save(withBadges(normalise(p)));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress() {
  save({ ...DEFAULT_STATE, settings: load().settings });
}
