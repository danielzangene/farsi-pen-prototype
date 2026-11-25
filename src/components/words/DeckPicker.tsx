"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, CalendarCheck, Layers, Mic } from "lucide-react";
import { LESSONS } from "@/content/lessons";
import { useProgress } from "@/lib/store";
import { buildDeck, NEW_PER_DAY, type Deck } from "@/lib/flashcards";
import { CardControls } from "@/components/CardControls";

/** Flashcard decks: today’s review, your saved cards, or one lesson’s words. */
export function DeckPicker({ onStart }: { onStart: (deck: Deck, title: string) => void }) {
  const s = useProgress();
  const [lesson, setLesson] = useState(LESSONS[0].id);
  const today = buildDeck("today", s);
  const mine = buildDeck("mine", s);
  const byLesson = buildDeck("lesson", s, lesson);
  const due = today.ids.filter((id) => s.cards[id]).length;
  const fresh = today.ids.length - due;
  const select = "select w-full";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-muted">See the word, guess the meaning, flip — then rate yourself.</p>
        <CardControls />
      </div>

      <section className="card p-5">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-firuze-soft text-firuze-ink">
            <CalendarCheck className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold">Today</h2>
            <p className="text-sm font-semibold text-muted">
              {today.ids.length === 0
                ? "All caught up. Nothing is due — come back tomorrow, or pick a deck below."
                : `${due} to review${fresh ? ` · ${fresh} new word${fresh === 1 ? "" : "s"} (max ${NEW_PER_DAY} a day)` : ""}`}
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary btn-lg mt-4 w-full" disabled={today.ids.length === 0} onClick={() => onStart(today, "Today")} autoFocus>
          {today.ids.length ? `Start · ${today.ids.length} cards` : "Done for today"}
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card flex flex-col p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-saffron-soft text-saffron-ink">
              <Bookmark className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold">My cards</h2>
              <p className="text-sm font-semibold text-muted">
                {mine.ids.length ? `${mine.ids.length} word${mine.ids.length === 1 ? "" : "s"} you added` : "Tap “Add to my cards” on any word to build your own deck."}
              </p>
            </div>
          </div>
          <button type="button" className="btn-secondary mt-4 w-full" disabled={!mine.ids.length} onClick={() => onStart(mine, "My cards")}>
            Study my cards
          </button>
        </section>

        <section className="card flex flex-col p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-soft text-sky-ink">
              <Layers className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold">By lesson</h2>
              <select className={`${select} mt-2`} value={lesson} onChange={(e) => setLesson(e.target.value)} aria-label="Lesson">
                {LESSONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.wordIds.length})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary mt-4 w-full"
            disabled={!byLesson.ids.length}
            onClick={() => onStart(byLesson, LESSONS.find((l) => l.id === lesson)?.title ?? "Lesson")}
          >
            Study this lesson
          </button>
        </section>
      </div>

      <Link href="/app/speak/" className="tile flex items-center gap-3 p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-anar-soft text-anar-ink">
          <Mic className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold">Speaking practice</span>
          <span className="block text-sm font-semibold text-muted">Hear each word, say it, and get a match score.</span>
        </span>
      </Link>
    </div>
  );
}
