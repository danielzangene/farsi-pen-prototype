"use client";
import { practisedBefore, useHydrated, useProgress } from "@/lib/store";
import { cx } from "@/lib/util";
import { Fa } from "@/components/ui";
import { Journey } from "@/components/journey/Journey";
import { DailyFlameCard } from "@/components/Flame";

/**
 * Home: the greeting, today's flame to claim (when signed in), then the whole course (Journey) in order. Missions, Scenes, Reading and the rest
 * live on Adventures; exams, numbers and settings on Profile.
 */
export default function Home() {
  const s = useProgress();
  const hydrated = useHydrated();
  return (
    <div className={cx("mx-auto max-w-2xl space-y-6 transition-opacity", hydrated ? "opacity-100" : "opacity-0")}>
      <div>
        <p className="text-muted">
          <Fa>سلام</Fa> · salâm{s.settings.name ? `, ${s.settings.name}` : ""}!
        </p>
        <h1 className="text-3xl font-extrabold">{practisedBefore(s) ? "Welcome back" : "Welcome"}</h1>
      </div>
      <DailyFlameCard />
      <Journey />
    </div>
  );
}
