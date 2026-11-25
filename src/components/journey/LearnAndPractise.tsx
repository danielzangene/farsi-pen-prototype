"use client";
import Link from "next/link";
import { Headphones, Layers, Mic } from "lucide-react";
import { buildDeck } from "@/lib/flashcards";
import { useProgress } from "@/lib/store";
import { WORDS } from "@/content/words";
import { cx } from "@/lib/util";
import { TONE, type Tone } from "@/components/ui";

/**
 * Below the path on Journey: practice on the words you've collected, one tap away,
 * each with a live line saying what's waiting there. Sounds is a step on the path
 * itself, and each finished lesson offers Speak and Hands-free on its own words.
 */
export function LearnAndPractise() {
  const s = useProgress();
  const due = buildDeck("today", s).ids.length;

  const tiles: { href: string; title: string; text: string; icon: typeof Mic; tone: Tone }[] = [
    { href: "/app/bookmarks/", title: "My cards", text: due ? `${due} cards due today` : `${WORDS.length} words`, icon: Layers, tone: "firuze" },
    { href: "/app/speak/", title: "Speak", text: "Say it, see each sound", icon: Mic, tone: "plum" },
    { href: "/app/listen/", title: "Hands-free", text: "Hear it, say it, repeat", icon: Headphones, tone: "pista" },
  ];

  return (
    <section aria-labelledby="learn-heading">
      <h2 id="learn-heading" className="text-xl font-extrabold">
        Practise
      </h2>
      <p className="mb-3 mt-0.5 text-sm text-muted">Your words, on cards, out loud or on the go.</p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="tile flex h-full items-center gap-3 p-4 sm:flex-col sm:items-start">
              <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl text-on-accent", TONE[t.tone].bg)}>
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
