"use client";
import Link from "next/link";
import { AudioLines, BookOpen, Headphones, Layers, Mic, Puzzle } from "lucide-react";
import { buildDeck } from "@/lib/flashcards";
import { journey } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { WORDS } from "@/content/words";
import { cx } from "@/lib/util";
import { TONE, type Tone } from "@/components/ui";

/**
 * Below the path on Journey: every section for learning and practising, one tap away,
 * each with a live line saying what's waiting there. Icons and tones match the nav.
 */
export function LearnAndPractise() {
  const s = useProgress();
  const j = Object.fromEntries(journey(s).map((x) => [x.id, x]));
  const due = buildDeck("today", s).ids.length;
  const count = (id: string, noun: string) => `${j[id].have} of ${j[id].total} ${noun}`;

  const tiles: { href: string; title: string; text: string; icon: typeof Mic; tone: Tone }[] = [
    { href: "/app/lessons/", title: "Lessons", text: count("lessons", "done"), icon: BookOpen, tone: "saffron" },
    { href: "/app/grammar/", title: "Grammar", text: count("grammar", "concepts"), icon: Puzzle, tone: "plum" },
    { href: "/app/sounds/", title: "Sounds", text: count("sounds", "stages"), icon: AudioLines, tone: "sky" },
    { href: "/app/words/", title: "Words", text: due ? `${due} cards due today` : `${WORDS.length} words`, icon: Layers, tone: "firuze" },
    { href: "/app/speak/", title: "Speak", text: "Say it, see each sound", icon: Mic, tone: "plum" },
    { href: "/app/listen/", title: "Hands-free", text: "Hear it, say it, repeat", icon: Headphones, tone: "pista" },
  ];

  return (
    <section aria-labelledby="learn-heading">
      <h2 id="learn-heading" className="text-xl font-extrabold">
        Learn &amp; practise
      </h2>
      <p className="mb-3 mt-0.5 text-sm text-muted">Every part of the course on its own, whenever you want it.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="tile flex h-full flex-col gap-3 p-4">
              <span className={cx("grid size-10 place-items-center rounded-xl text-on-accent", TONE[t.tone].bg)}>
                <t.icon className="size-5" strokeWidth={2.2} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold leading-tight">{t.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{t.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
