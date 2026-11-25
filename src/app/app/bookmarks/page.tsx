"use client";
import { useEffect, useState } from "react";
import { Bookmark, Eye, EyeOff, Keyboard, RotateCcw, Target, ThumbsUp, Trophy } from "lucide-react";
import { WORD_BY_ID } from "@/content/words";
import type { Deck } from "@/lib/flashcards";
import { getWord } from "@/lib/words";
import { completePractice, toggleHidden, useHydrated, useProgress, type SessionSummary } from "@/lib/store";
import { cx, shuffle } from "@/lib/util";
import { CardControls } from "@/components/CardControls";
import { FlashcardSession } from "@/components/FlashcardSession";
import { RecallRound } from "@/components/RecallRound";
import { PageHeader, Segmented, StatCard } from "@/components/ui";
import { WordCard } from "@/components/WordCard";
import { Browse } from "@/components/words/Browse";
import { DeckPicker } from "@/components/words/DeckPicker";

type Tab = "review" | "saved" | "browse";
const TAB_KEY = "farsipen:mycards-tab";

/**
 * My cards: everything about words in one place. Review (today's due cards, your saved
 * cards or one lesson's words as flashcards), your saved and hidden words, and Browse.
 * Opened from the tab bar and from Journey; /app/words/ redirects here.
 */
export default function MyCardsPage() {
  const s = useProgress();
  const hydrated = useHydrated();
  const [tab, setTab] = useState<Tab>("review");
  const [session, setSession] = useState<{ deck: Deck; title: string; key: number } | null>(null);

  // Remember the last tab (per-viewer convenience).
  useEffect(() => {
    try {
      const t = localStorage.getItem(TAB_KEY);
      if (t === "review" || t === "saved" || t === "browse") setTab(t);
    } catch {}
  }, []);
  const changeTab = (t: Tab) => {
    setTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };

  if (!hydrated) return null;
  if (session) return <FlashcardSession key={session.key} deck={session.deck} title={session.title} onExit={() => setSession(null)} />;

  return (
    <div>
      <PageHeader title="My cards" subtitle="Review your words, keep the ones you save, and look up any word.">
        <Segmented
          label="View"
          value={tab}
          onChange={changeTab}
          options={[
            { value: "review", label: "Review" },
            { value: "saved", label: `Saved (${s.bookmarks.length})` },
            { value: "browse", label: "Browse" },
          ]}
        />
      </PageHeader>
      {tab === "review" ? (
        <DeckPicker onStart={(deck, title) => setSession({ deck, title, key: Date.now() })} />
      ) : tab === "saved" ? (
        <Saved onFindWords={() => changeTab("review")} />
      ) : (
        <Browse />
      )}
    </div>
  );
}

/** Saved words (and the ones hidden from practice), with typed-recall practice. */
function Saved({ onFindWords }: { onFindWords: () => void }) {
  const s = useProgress();
  const [list, setList] = useState<"bookmarks" | "hidden">("bookmarks");
  const [practising, setPractising] = useState<string[] | null>(null);
  const [result, setResult] = useState<SessionSummary | null>(null);
  const [round, setRound] = useState(0);

  const ids = list === "bookmarks" ? s.bookmarks : s.hidden;
  const words = ids.map((id) => getWord(id, s.customWords)).filter((w): w is NonNullable<typeof w> => !!w);

  const startPractice = () => {
    setResult(null);
    // Typed recall needs a transliteration, so it uses course words; flashcards cover your own words too.
    setPractising(shuffle(s.bookmarks.filter((id) => WORD_BY_ID[id])).slice(0, 15));
    setRound((n) => n + 1);
  };

  if (practising) {
    if (!result)
      return (
        <div className="mx-auto max-w-3xl">
          <RecallRound
            key={round}
            words={practising.map((id) => WORD_BY_ID[id])}
            label="My cards"
            onExit={() => setPractising(null)}
            toolbar={<CardControls />}
            onDone={(r) => {
              completePractice(r);
              setResult(r);
            }}
          />
        </div>
      );
    const good = Object.values(result.outcomes).filter((o) => o !== "again").length;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center pt-4 text-center sm:pt-10">
        <span className="grid size-24 animate-pop place-items-center rounded-full bg-saffron text-on-accent">
          <Trophy className="size-12" />
        </span>
        <h2 className="mt-5 text-3xl font-extrabold text-saffron-ink sm:text-4xl">My cards practised!</h2>
        <p className="mt-2 font-semibold text-muted">
          {result.correct}/{result.total} right first time
        </p>
        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          <StatCard label="Accuracy" value={`${Math.round((result.correct / result.total) * 100)}%`} tone="pista" icon={<Target className="size-5" />} />
          <StatCard label="Good" value={good} tone="sky" icon={<ThumbsUp className="size-5" />} />
          <StatCard label="Again" value={result.total - good} tone="anar" icon={<RotateCcw className="size-5" />} />
        </div>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row-reverse">
          <button type="button" className="btn-primary btn-lg flex-1" onClick={() => setPractising(null)} autoFocus>
            Back to my cards
          </button>
          <button type="button" className="btn-secondary btn-lg flex-1" onClick={startPractice}>
            Practise again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {list === "bookmarks" && words.length > 0 && (
          <button type="button" className="btn-primary btn-lg w-full sm:w-auto" onClick={startPractice}>
            <Keyboard className="size-5" /> Type from memory
          </button>
        )}
        <button
          type="button"
          className={cx("btn-ghost btn-sm", list === "bookmarks" && words.length > 0 && "sm:ms-auto")}
          onClick={() => setList(list === "bookmarks" ? "hidden" : "bookmarks")}
        >
          {list === "bookmarks" ? (
            <>
              <EyeOff className="size-4" /> Hidden words ({s.hidden.length})
            </>
          ) : (
            <>
              <Bookmark className="size-4" /> Back to saved ({s.bookmarks.length})
            </>
          )}
        </button>
      </div>

      {words.length === 0 ? (
        <div className="card mx-auto flex max-w-xl flex-col items-center p-8 text-center">
          <span
            className={
              list === "bookmarks"
                ? "grid size-20 place-items-center rounded-full bg-saffron-soft text-saffron-ink"
                : "grid size-20 place-items-center rounded-full bg-paper text-muted"
            }
          >
            {list === "bookmarks" ? <Bookmark className="size-10" /> : <EyeOff className="size-10" />}
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">{list === "bookmarks" ? "No cards saved yet" : "No hidden words"}</h2>
          <p className="mt-2 max-w-sm font-semibold text-muted">
            {list === "bookmarks"
              ? "Tap the bookmark icon (Add to my cards) on any word, in flashcards, lessons or Browse, to collect it here."
              : "Words you hide during practice appear here. They won't come up in your flashcards."}
          </p>
          {list === "bookmarks" && (
            <button type="button" className="btn-secondary mt-6" onClick={onFindWords}>
              Go to flashcards
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w) => (
            <WordCard
              key={w.id}
              word={w}
              extra={
                list === "hidden" && (
                  <button type="button" className="btn-ghost btn-sm" onClick={() => toggleHidden(w.id)}>
                    <Eye className="size-4" /> Unhide
                  </button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
