"use client";
import Link from "next/link";
import { ArrowRight, BookHeart, BookOpenText, ChevronRight, Clapperboard, Compass, MessagesSquare, PartyPopper } from "lucide-react";
import { hasBackend } from "@/lib/backend";
import { buildPath, KIND_LABEL, nextOnPath } from "@/lib/path";
import { useProgress } from "@/lib/store";
import { Fa, LinkTiles, ProgressBar, type LinkTile } from "../ui";

/** The next step on the Journey (the whole course in order), with one Start / Continue button. */
export function NextOnJourney() {
  const s = useProgress();
  const sections = buildPath(s);
  const next = nextOnPath(sections, s);
  const all = sections.flatMap((x) => x.items);
  const done = all.filter((i) => i.done).length;

  if (!next)
    return (
      <section className="card p-5 sm:p-6" aria-labelledby="next-step-heading">
        <h2 id="next-step-heading" className="flex items-center gap-2 text-xl font-extrabold">
          <PartyPopper className="size-6 text-saffron-ink" aria-hidden /> You&apos;ve walked the whole journey
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted">New steps are being written. Keep going with the adventures below.</p>
      </section>
    );

  const { section, item } = next;
  const emoji = /\p{Extended_Pictographic}/u.test(item.badge);
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="next-step-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="next-step-heading" className="eyebrow text-muted">
          Next on your journey
        </h2>
        <Link href="/app/path/" className="text-sm font-bold text-muted hover:text-ink">
          {done} of {all.length} steps <ChevronRight className="inline size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-firuze-soft" aria-hidden>
          {emoji ? <span className="text-3xl">{item.badge}</span> : <Fa className="text-2xl font-bold text-firuze-ink">{item.badge}</Fa>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-muted">
            Section {section.number} · {section.title}
          </p>
          <p className="truncate text-xl font-extrabold">{item.title}</p>
          <p className="truncate text-sm font-semibold text-muted">
            {KIND_LABEL[item.kind]} · {item.subtitle}
          </p>
        </div>
      </div>
      <ProgressBar value={all.length ? done / all.length : 0} className="mt-4" />
      <Link href={item.href} className="btn-primary btn-lg mt-5 w-full">
        {item.progress > 0 ? "Continue" : "Start"} <ArrowRight className="size-5" />
      </Link>
    </section>
  );
}

/** Adventures: real Persian beyond the course — missions, scenes, reading, poetry and the tutor. */
export function Adventures() {
  const items: LinkTile[] = [
    { href: "/app/missions/", title: "Missions", text: "Real situations, real skills", icon: Compass, tone: "firuze" },
    { href: "/app/scenes/", title: "Scenes", text: "Play a part, line by line", icon: Clapperboard, tone: "saffron" },
    { href: "/app/reading/", title: "Reading", text: "Short texts at your level", icon: BookOpenText, tone: "sky" },
    { href: "/app/poetry/", title: "Poetry", text: "Hafez, Saadi, Khayyam", icon: BookHeart, tone: "plum" },
    ...(hasBackend ? [{ href: "/app/tutor/", title: "AI tutor", text: "Chat in Persian", icon: MessagesSquare, tone: "pista" as const }] : []),
  ];
  return (
    <section aria-labelledby="adventures-heading">
      <h2 id="adventures-heading" className="mb-3 text-xl font-extrabold">
        Adventures
      </h2>
      <LinkTiles items={items} />
    </section>
  );
}
