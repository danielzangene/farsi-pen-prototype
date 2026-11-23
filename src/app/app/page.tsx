"use client";
import { useHydrated, useProgress } from "@/lib/store";
import { cx } from "@/lib/util";
import { Fa } from "@/components/ui";
import { Adventures, NextOnJourney } from "@/components/home/HomeSections";

/**
 * Home: the greeting, the next Journey step to continue, then the adventures.
 * The course itself lives on Journey, exams on Exams, numbers on Progress, settings on Profile.
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
        <h1 className="text-3xl font-extrabold">{s.xp > 0 ? "Welcome back" : "Welcome"}</h1>
      </div>

      <NextOnJourney />
      <Adventures />
    </div>
  );
}
