"use client";
import { useState } from "react";
import { Flame } from "lucide-react";
import { canClaim, claimDailyFlame, useFlame } from "@/lib/flame";
import { cx } from "@/lib/util";

const plural = (n: number) => `${n} ${n === 1 ? "flame" : "flames"}`;

/** The learner's flames, for the app bar. Nothing without sign-in; a dash while the first read is on its way. */
export function FlameCount() {
  const f = useFlame();
  if (f.status === "off") return null;
  const known = f.status === "ready";
  return (
    <span
      className="flex items-center gap-1 rounded-xl px-1.5 py-1.5 text-base font-extrabold text-saffron-ink lg:px-2"
      title="Flames"
      aria-label={known ? plural(f.flame) : "Flames loading"}
    >
      <Flame className={cx("size-5", known ? "fill-saffron text-saffron-shadow" : "fill-line text-faint")} aria-hidden />
      <span className={known ? undefined : "text-muted"}>{known ? f.flame : "–"}</span>
    </span>
  );
}

/**
 * Home's daily flame: a button to claim today's 1–4 flames while it's open, then what the claim added.
 * Hidden without sign-in, before the balance has loaded, and once today's flame was claimed on an earlier visit.
 * A new day's claim wins over an earlier result, so a tab left open past midnight (UTC) offers it again.
 */
export function DailyFlameCard() {
  const f = useFlame();
  const [failed, setFailed] = useState(false);
  const open = canClaim(f);
  const result = !open && !f.claiming ? f.justGained : null;
  if (f.status !== "ready" || (!open && !f.claiming && !result)) return null;

  const claim = async () => {
    setFailed(false);
    try {
      await claimDailyFlame();
    } catch {
      setFailed(true);
    }
  };

  return (
    <section className="card flex items-center gap-4 p-4" aria-labelledby="daily-flame-heading" aria-live="polite">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-saffron-soft" aria-hidden>
        <Flame className={cx("size-6 fill-saffron text-saffron-shadow", !!result && "animate-pop")} />
      </span>
      <div className="min-w-0 flex-1">
        {result ? (
          <>
            <h2 id="daily-flame-heading" className="font-extrabold">
              +{plural(result)}
            </h2>
            <p className="text-sm text-muted">You have {plural(f.flame)}. Come back tomorrow for more.</p>
          </>
        ) : (
          <>
            <h2 id="daily-flame-heading" className="font-extrabold">
              Today&apos;s flame is ready
            </h2>
            <p className="text-sm text-muted">{failed ? "Couldn't claim it. Check your connection and try again." : "Claim 1 to 4 flames, once a day."}</p>
          </>
        )}
      </div>
      {!result && (
        <button type="button" className="btn-primary btn-sm shrink-0" onClick={claim} disabled={!open}>
          {f.claiming ? "Claiming…" : "Claim"}
        </button>
      )}
    </section>
  );
}
