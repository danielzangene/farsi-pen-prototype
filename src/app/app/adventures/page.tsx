"use client";
import { BookHeart, BookOpenText, Clapperboard, Compass, MessagesSquare, PenLine } from "lucide-react";
import { LETTERS, TRACE_PASS } from "@/content/alphabet";
import { MISSIONS } from "@/content/missions";
import { FAL, MORE } from "@/content/poems";
import { READINGS } from "@/content/readings";
import { SCENES } from "@/content/scenes";
import { hasBackend } from "@/lib/backend";
import { displayState } from "@/lib/mastery";
import { useHydrated, useProgress } from "@/lib/store";
import { LinkTiles, PageHeader, type LinkTile } from "@/components/ui";

/**
 * Adventures: everything outside the course on Home, in two groups. Each tile says what it is until
 * you've started, then how far you've got. Missions, Scenes, Reading, Poetry, Alphabet and the tutor
 * count as part of this tab in AppNav.
 */
export default function AdventuresPage() {
  const s = useProgress();
  const hydrated = useHydrated();
  // Before hydration there is no saved progress to read, so every tile shows its description.
  const live = (have: number, total: number, unit: string, intro: string) => (hydrated && have > 0 ? `${have} of ${total} ${unit}` : intro);

  const missionsDone = MISSIONS.filter((m) => m.skills.every((sk) => displayState(s.skills[sk.id]) === "mastered")).length;
  const scenesDone = SCENES.filter((sc) => s.scenes?.[sc.id]).length;
  const readingsDone = READINGS.filter((r) => s.readings?.[r.id]).length;
  const lettersTraced = LETTERS.filter((l) => (s.traced[l.id] ?? 0) >= TRACE_PASS).length;

  const outAndAbout: LinkTile[] = [
    { href: "/app/missions/", title: "Missions", text: live(missionsDone, MISSIONS.length, "mastered", "Taxi, café, bazaar and more"), icon: Compass, tone: "firuze" },
    { href: "/app/scenes/", title: "Scenes", text: live(scenesDone, SCENES.length, "played", "Act out everyday sketches"), icon: Clapperboard, tone: "saffron" },
    ...(hasBackend ? [{ href: "/app/tutor/", title: "AI tutor", text: "Chat in Persian, get gentle fixes", icon: MessagesSquare, tone: "pista" as const }] : []),
  ];
  const readAndWrite: LinkTile[] = [
    { href: "/app/reading/", title: "Reading", text: live(readingsDone, READINGS.length, "read", "Short texts with news words"), icon: BookOpenText, tone: "sky" },
    { href: "/app/poetry/", title: "Poetry", text: `Hafez, Saadi and Khayyam · ${FAL.length + MORE.length} lines`, icon: BookHeart, tone: "plum" },
    { href: "/app/alphabet/", title: "Alphabet", text: live(lettersTraced, LETTERS.length, "letters traced", "Hear, see and trace every letter"), icon: PenLine, tone: "pista" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Adventures" subtitle="Real Persian, your way: situations to get through, scenes to act, and texts and poems to read." />
      <Group id="out" title="Out and about" text="Use Persian the way you would on a trip or at a family dinner." items={outAndAbout} />
      <Group id="read" title="Read and write" text="The script, real texts and the poems every Iranian knows." items={readAndWrite} />
    </div>
  );
}

function Group({ id, title, text, items }: { id: string; title: string; text: string; items: LinkTile[] }) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-xl font-extrabold">
        {title}
      </h2>
      <p className="mb-3 mt-0.5 text-sm text-muted">{text}</p>
      <LinkTiles items={items} />
    </section>
  );
}
