"use client";
import { Headphones, Layers, Mic } from "lucide-react";
import { buildDeck } from "@/lib/flashcards";
import { useProgress } from "@/lib/store";
import { WORDS } from "@/content/words";
import { LinkTiles } from "@/components/ui";

/**
 * Below the path on Journey: practice on your own words. Sounds is a step on the path
 * itself, and each finished lesson offers Speak and Hands-free on its own words.
 */
export function Practise() {
  const s = useProgress();
  const due = buildDeck("today", s).ids.length;
  return (
    <section aria-labelledby="practise-heading">
      <h2 id="practise-heading" className="text-xl font-extrabold">
        Practise
      </h2>
      <p className="mb-3 mt-0.5 text-sm text-muted">Your words, on cards, out loud or on the go.</p>
      <LinkTiles
        items={[
          { href: "/app/bookmarks/", title: "My cards", text: due ? `${due} cards due today` : `${WORDS.length} words`, icon: Layers, tone: "firuze" },
          { href: "/app/speak/", title: "Speak", text: "Say it, see each sound", icon: Mic, tone: "plum" },
          { href: "/app/listen/", title: "Hands-free", text: "Hear it, say it, repeat", icon: Headphones, tone: "pista" },
        ]}
      />
    </section>
  );
}
