"use client";
import { useState } from "react";
import { BookOpen, CalendarCheck, ChevronLeft, ChevronRight, Flame, GraduationCap, TrendingDown, TrendingUp } from "lucide-react";
import { dayKey } from "@/lib/gamification";
import { useFlame } from "@/lib/flame";
import { courseProgress, dayState, monthGrid, soundTrends } from "@/lib/progress";
import { useProgress, wordsLearned } from "@/lib/store";
import { cx } from "@/lib/util";
import { Fa, ProgressBar } from "@/components/ui";
import { BadgesCard } from "@/components/Achievements";

/** Profile's Progress group: flames and practice tiles, the practice calendar, sounds, course and badges. Render after hydration. */
export function ProgressStats() {
  const s = useProgress();
  const flame = useFlame();
  const lessonsDone = Object.values(s.lessons).filter((l) => l.completedAt).length;
  const practisedDays = Object.keys(s.daily).filter((k) => dayState(s, k) !== "none").length;
  return (
    <>
      <div className={cx("grid grid-cols-2 gap-3", flame.status === "off" ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
        {flame.status !== "off" && (
          <Tile icon={<Flame className="size-5 fill-saffron text-saffron-shadow" />} value={flame.status === "ready" ? flame.flame : "–"} label="flames" />
        )}
        <Tile icon={<CalendarCheck className="size-5 text-sky-ink" />} value={practisedDays} label="days practised" />
        <Tile icon={<BookOpen className="size-5 text-firuze-ink" />} value={wordsLearned(s)} label="words learned" />
        <Tile icon={<GraduationCap className="size-5 text-pista-ink" />} value={lessonsDone} label="lessons done" />
      </div>
      <PracticeCalendar />
      <SoundsOverTime />
      <CourseProgress />
      <BadgesCard />
    </>
  );
}

function Tile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="card p-4">
      <span className="flex items-center gap-2 text-2xl font-extrabold">
        <span aria-hidden>{icon}</span>
        {value}
      </span>
      <span className="text-sm font-semibold text-muted">{label}</span>
    </div>
  );
}

function PracticeCalendar() {
  const s = useProgress();
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const weeks = monthGrid(month);
  const todayKey = dayKey(today);
  const days = weeks.flat().filter((d): d is Date => !!d);
  const practised = days.filter((d) => dayState(s, dayKey(d)) !== "none").length;
  const goals = days.filter((d) => dayState(s, dayKey(d)) === "goal").length;
  return (
    <section className="card p-5" aria-labelledby="cal-heading">
      <div className="flex items-center justify-between gap-2">
        <h3 id="cal-heading" className="text-xl font-extrabold">
          {month.toLocaleDateString("en", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button type="button" className="btn-ghost btn-icon" onClick={() => setOffset(offset - 1)} aria-label="Previous month">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" className="btn-ghost btn-icon" onClick={() => setOffset(offset + 1)} disabled={offset >= 0} aria-label="Next month">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-muted">
        {practised} {practised === 1 ? "day" : "days"} practised · daily goal met on {goals}
      </p>
      <table className="mt-4 w-full table-fixed border-separate border-spacing-1 text-center">
        <thead>
          <tr>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <th key={i} scope="col" className="text-xs font-extrabold text-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={i}>
              {w.map((d, j) => {
                if (!d) return <td key={j} />;
                const key = dayKey(d);
                const st = dayState(s, key);
                return (
                  <td key={j}>
                    <span
                      className={cx(
                        "mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full text-sm font-bold",
                        st === "goal" ? "bg-anar text-on-accent" : st === "practised" ? "bg-anar-soft text-anar-ink" : "text-muted",
                        key === todayKey && "ring-[3px] ring-sky",
                      )}
                      title={st === "goal" ? "Daily goal met" : st === "practised" ? "Practised" : undefined}
                    >
                      {d.getDate()}
                      <span className="sr-only">{st === "goal" ? ", goal met" : st === "practised" ? ", practised" : ""}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-anar" /> Daily goal met
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-anar-soft" /> Practised
        </span>
      </p>
    </section>
  );
}

function Sparkline({ points }: { points: { day: string; value: number }[] }) {
  const w = 120;
  const h = 36;
  if (points.length < 2) return <span className="text-xs font-semibold text-muted">More days needed</span>;
  const x = (i: number) => 4 + (i / (points.length - 1)) * (w - 8);
  const y = (v: number) => 4 + (1 - v / 100) * (h - 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-28 shrink-0" role="img" aria-label={`From ${points[0].value} to ${points[points.length - 1].value}`}>
      <line x1="4" x2={w - 4} y1={y(85)} y2={y(85)} className="stroke-line" strokeWidth="1" strokeDasharray="3 3" />
      <polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} className="fill-none stroke-firuze" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={p.day} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4 : 8} className={i === points.length - 1 ? "fill-firuze stroke-card" : "fill-transparent"} strokeWidth="2">
          <title>
            {p.day}: {p.value}
          </title>
        </circle>
      ))}
    </svg>
  );
}

function SoundsOverTime() {
  const s = useProgress();
  const trends = soundTrends(s);
  return (
    <section className="card p-5" aria-labelledby="sounds-heading">
      <h3 id="sounds-heading" className="text-xl font-extrabold">
        Your sounds over time
      </h3>
      <p className="text-sm font-semibold text-muted">Score per sound from your spoken takes. The dashed line is 85, where a sound counts as solid.</p>
      {trends.length === 0 ? (
        <p className="mt-4 font-semibold text-muted">Say some words out loud in Speak, Sounds or Scenes and they'll show up here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {trends.map((t) => (
            <li key={t.sound.id} className="flex items-center gap-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper">
                <Fa className="text-lg font-bold">{t.sound.letters.split(" ")[0]}</Fa>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{t.sound.name}</span>
                <span className={cx("flex items-center gap-1 text-sm font-bold", t.change > 0 ? "text-pista-ink" : t.change < 0 ? "text-anar-ink" : "text-muted")}>
                  {t.change > 0 ? <TrendingUp className="size-4" /> : t.change < 0 ? <TrendingDown className="size-4" /> : null}
                  {t.change > 0 ? `+${t.change}` : t.change < 0 ? t.change : "No change yet"}
                </span>
              </span>
              <Sparkline points={t.points} />
              <span className="w-10 shrink-0 text-end text-lg font-extrabold">{t.now}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CourseProgress() {
  const s = useProgress();
  const rows = courseProgress(s);
  return (
    <section className="card p-5" aria-labelledby="course-heading">
      <h3 id="course-heading" className="text-xl font-extrabold">
        Across the course
      </h3>
      <ul className="mt-4 space-y-4">
        {rows.map((r) => (
          <li key={r.id}>
            <p className="flex justify-between gap-2 text-sm font-bold">
              <span>{r.label}</span>
              <span className="text-muted">
                {r.have}/{r.total}
              </span>
            </p>
            <ProgressBar value={r.total ? r.have / r.total : 0} tone="firuze" size="sm" className="mt-1.5" />
          </li>
        ))}
      </ul>
    </section>
  );
}
