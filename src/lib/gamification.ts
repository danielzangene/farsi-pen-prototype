// Badges and the local day key. Pure functions so they can be unit-tested.
// Flames (the reward balance) live on the learner's Supabase profile: see flame.ts.

/** Local calendar date as YYYY-MM-DD (the user's own time zone). */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface BadgeStats {
  lessonsDone: number;
  totalLessons: number;
  level1Done: number;
  level1Total: number;
  wordsLearned: number;
  lettersTraced: number;
  totalLetters: number;
  grammarDone: number;
  totalGrammar: number;
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  progress: (s: BadgeStats) => [number, number];
}

export const BADGES: Badge[] = [
  { id: "first-lesson", emoji: "🌱", name: "First Words", description: "Finish your first lesson", progress: (s) => [Math.min(s.lessonsDone, 1), 1] },
  { id: "level-1", emoji: "📗", name: "Level 1 Done", description: "Finish every Level 1 lesson", progress: (s) => [s.level1Done, s.level1Total] },
  { id: "all-lessons", emoji: "🎓", name: "Every Lesson", description: "Finish every lesson, Levels 1 to 4", progress: (s) => [s.lessonsDone, s.totalLessons] },
  { id: "words-25", emoji: "🗂️", name: "Word Collector", description: "Learn 25 words", progress: (s) => [Math.min(s.wordsLearned, 25), 25] },
  { id: "words-100", emoji: "📚", name: "Hundred Words", description: "Learn 100 words", progress: (s) => [Math.min(s.wordsLearned, 100), 100] },
  { id: "first-trace", emoji: "✍️", name: "First Stroke", description: "Trace your first letter", progress: (s) => [Math.min(s.lettersTraced, 1), 1] },
  { id: "all-letters", emoji: "🖋️", name: "Full Alphabet", description: "Trace every letter", progress: (s) => [s.lettersTraced, s.totalLetters] },
  { id: "grammar", emoji: "🧩", name: "Grammar Starter", description: "Pass 5 grammar concepts", progress: (s) => [Math.min(s.grammarDone, 5), Math.min(5, s.totalGrammar)] },
  { id: "grammar-all", emoji: "🏛️", name: "Grammar Master", description: "Pass every grammar concept", progress: (s) => [s.grammarDone, s.totalGrammar] },
];

export function earnedBadges(stats: BadgeStats): Set<string> {
  return new Set(
    BADGES.filter((b) => {
      const [have, need] = b.progress(stats);
      return need > 0 && have >= need;
    }).map((b) => b.id),
  );
}
