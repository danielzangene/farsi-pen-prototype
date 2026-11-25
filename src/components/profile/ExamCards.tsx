"use client";
import Link from "next/link";
import { SAMFA_FACTS } from "@/content/samfa";
import { useProgress } from "@/lib/store";
import { Fa, ProgressBar } from "@/components/ui";
import { LEVEL_NAME } from "@/lib/placement";

/** Profile's Exams group: the placement test and SAMFA practice, each with its last result. Render after hydration. */
export function ExamCards() {
  const s = useProgress();
  const mocks = s.samfa?.mocks ?? [];
  const last = mocks[mocks.length - 1];
  return (
    <>
      <section className="card p-5 sm:p-6" aria-labelledby="placement-heading">
        <p className="text-sm font-semibold text-firuze-ink">Placement test · 3–6 minutes</p>
        <h3 id="placement-heading" className="mt-1 text-2xl font-extrabold">
          Find your level
        </h3>
        <p className="mt-1 text-muted">Words, grammar and listening from A1 up to B2. Your course on Home then starts where you are.</p>
        {s.placement && (
          <p className="mt-3 rounded-xl bg-paper px-4 py-3 text-sm">
            Last result: <strong className="font-bold">{LEVEL_NAME[s.placement.level]}</strong> · {s.placement.correct}/{s.placement.total} right
          </p>
        )}
        <Link href="/app/placement/" className="btn-primary btn-lg mt-5 w-full">
          {s.placement ? "Take it again" : "Start the test"}
        </Link>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="samfa-heading">
        <p className="text-sm font-semibold text-plum-ink">
          {SAMFA_FACTS.full} · <Fa>{SAMFA_FACTS.fa}</Fa>
        </p>
        <h3 id="samfa-heading" className="mt-1 text-2xl font-extrabold">
          SAMFA
        </h3>
        <p className="mt-1 text-muted">Listening, reading, writing and speaking, 60 points each. Practise one part or take a short mock scored out of 240.</p>
        {last ? (
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Last mini mock</span>
              <span className="font-bold">{last.total}/240</span>
            </div>
            <ProgressBar value={last.total / 240} tone="plum" size="sm" className="mt-1.5" />
          </div>
        ) : null}
        <Link href="/app/samfa/" className="btn-plum btn-lg mt-5 w-full sm:w-auto">
          Open SAMFA
        </Link>
      </section>
    </>
  );
}
