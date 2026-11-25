"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CircleUserRound, Flame, House, MapIcon, Star } from "lucide-react";
import { currentStreak, useProgress } from "@/lib/store";
import { cx, IS_DEV_SITE } from "@/lib/util";
import { Avatar } from "@/components/Avatar";
import { TONE, type Tone } from "@/components/ui";

type NavItem = { href: string; label: string; icon: typeof House; tone?: Tone; exact?: boolean };

/**
 * The four destinations, in tab order: Home (Journey, the course), My cards (which holds Words),
 * Adventures (Missions, Scenes, Reading, Poetry, Alphabet, AI tutor) and Profile (Exams, Progress, Settings).
 * Tabs on phones, the sidebar on desktop.
 */
const TABS: NavItem[] = [
  { href: "/app/", label: "Home", icon: House, tone: "firuze", exact: true },
  { href: "/app/bookmarks/", label: "My cards", icon: Bookmark, tone: "saffron" },
  { href: "/app/adventures/", label: "Adventures", icon: MapIcon, tone: "sky" },
  { href: "/app/settings/", label: "Profile", icon: CircleUserRound, tone: "pista" },
];
const PROFILE_HREF = "/app/settings/";

/** Pages without a tab of their own, by the tab that stays highlighted while they're open. */
const ALSO_UNDER: Record<string, string[]> = {
  "/app/": ["/app/path/", "/app/lessons/", "/app/grammar/", "/app/sounds/", "/app/speak/", "/app/listen/"],
  "/app/bookmarks/": ["/app/words/"],
  "/app/adventures/": ["/app/missions/", "/app/scenes/", "/app/reading/", "/app/poetry/", "/app/alphabet/", "/app/tutor/"],
  "/app/settings/": ["/app/samfa/", "/app/placement/", "/app/privacy/", "/app/review/"],
};

/** "FA" set in Nunito Black, as outlines on the 64×64 tile. Shared with scripts/make-icons.mjs (favicon, app icons, share image). */
export const LOGO_PATH =
  "M15.47 43.66Q13.8 43.66 12.9 42.74Q12 41.82 12 40.09V24.23Q12 22.5 12.92 21.58Q13.83 20.66 15.57 20.66H26.02Q27.34 20.66 28.02 21.34Q28.69 22.01 28.69 23.3Q28.69 24.59 28.02 25.26Q27.34 25.94 26.02 25.94H18.91V29.48H25.28Q26.6 29.48 27.28 30.15Q27.95 30.83 27.95 32.11Q27.95 33.4 27.28 34.07Q26.6 34.75 25.28 34.75H18.91V40.09Q18.91 43.66 15.47 43.66ZM30.85 43.66Q29.69 43.66 28.9 43.11Q28.11 42.56 27.9 41.62Q27.69 40.67 28.24 39.48L35.99 23.14Q36.67 21.69 37.65 21.02Q38.63 20.34 39.91 20.34Q41.2 20.34 42.17 21.02Q43.13 21.69 43.81 23.14L51.56 39.48Q52.14 40.7 51.96 41.65Q51.78 42.6 51.03 43.13Q50.27 43.66 49.14 43.66Q47.67 43.66 46.86 42.98Q46.06 42.31 45.41 40.8L43.87 37.19L46.44 39.12H33.35L35.93 37.19L34.38 40.8Q33.74 42.31 33.03 42.98Q32.33 43.66 30.85 43.66ZM39.85 27.8 36.57 35.68 35.61 33.85H44.19L43.23 35.68L39.91 27.8H39.85Z";

/** The "FA" monogram on a teal tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cx("grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-firuze text-on-accent", className)}>
      <svg viewBox="0 0 64 64" className="size-full" fill="currentColor" aria-hidden>
        <path d={LOGO_PATH} />
      </svg>
    </span>
  );
}

/** Brand mark + name. `compact` shows the mark only; `bar` is the phone top-bar size (name hidden on very narrow screens). */
export function Logo({ compact, bar }: { compact?: boolean; bar?: boolean }) {
  return (
    <Link
      href="/"
      className={cx("flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl font-extrabold tracking-tight text-firuze-ink", bar ? "text-xl" : "text-2xl")}
      aria-label="Farsi Pen home"
    >
      <LogoMark />
      {!compact && <span className={cx(bar && "max-[359px]:hidden")}>Farsi Pen</span>}
      {IS_DEV_SITE && <span className="chip bg-saffron-soft text-saffron-ink">DEV</span>}
    </Link>
  );
}

function StatChips({ streak, xp }: { streak: number; xp: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex items-center gap-1 rounded-xl px-1.5 py-1.5 text-base font-extrabold text-anar-ink lg:px-2" title="Day streak" aria-label={`${streak} day streak`}>
        <Flame className={cx("size-5", streak > 0 ? "fill-anar text-anar-ink" : "fill-line text-faint")} aria-hidden />
        <span className={streak > 0 ? undefined : "text-muted"}>{streak}</span>
      </span>
      <span className="flex items-center gap-1 rounded-xl px-1.5 py-1.5 text-base font-extrabold text-saffron-ink lg:px-2" title="Total XP" aria-label={`${xp} XP`}>
        <Star className="size-5 fill-saffron text-saffron-shadow" aria-hidden />
        {xp}
      </span>
    </div>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const s = useProgress();
  const isActive = (href: string, exact?: boolean) =>
    (exact ? pathname === href || pathname === href.slice(0, -1) : pathname.startsWith(href.slice(0, -1))) ||
    (ALSO_UNDER[href] ?? []).some((h) => pathname.startsWith(h.slice(0, -1)));
  const streak = currentStreak(s);
  // The Profile tab and sidebar link show the learner's photo when there is one, instead of the person icon.
  const photoFor = (href: string) => (href === PROFILE_HREF ? s.settings.avatarUrl : null);
  // The tab to highlight: the page's own, or the one it lives under (e.g. Missions → Adventures, SAMFA → Profile).
  const activeTab = TABS.findIndex((t) => isActive(t.href, t.exact));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="app-nav fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-line bg-card px-3 py-6 lg:flex">
        <div className="px-3">
          <Logo />
        </div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {/* The same four destinations as the phone tab bar. */}
          {TABS.map((l, i) => (
            <SideLink key={l.href} item={l} on={activeTab === i} photo={photoFor(l.href)} />
          ))}
        </nav>
      </aside>

      {/* Mobile top bar: brand and progress. On desktop the stat chips, top right of the content column. Profile is a tab. */}
      <header className="app-nav max-lg:material-canvas sticky top-0 z-30 border-b border-line lg:static lg:border-0">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4 lg:h-auto lg:justify-end lg:pt-5">
          <div className="mr-auto lg:hidden">
            <Logo bar />
          </div>
          <StatChips streak={streak} xp={s.xp} />
        </div>
      </header>

      {/* Mobile tab bar: a floating glass capsule; a glass pill slides to the current tab. */}
      <nav
        className="app-nav glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-[1.75rem] p-1 lg:hidden"
        aria-label="Main"
      >
        <div className="relative flex">
          {activeTab >= 0 && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 p-0 transition-transform duration-[420ms] ease-[var(--ease-spring)] motion-reduce:transition-none"
              style={{ width: `${100 / TABS.length}%`, transform: `translateX(${activeTab * 100}%)` }}
            >
              <span className="block size-full rounded-[1.5rem] bg-[var(--glass-pill)] shadow-[inset_0_1px_0_var(--glass-highlight)]" />
            </span>
          )}
          {TABS.map((t, i) => (
            <TabLink key={t.href} href={t.href} label={t.label} icon={t.icon} on={activeTab === i} photo={photoFor(t.href)} />
          ))}
        </div>
      </nav>
    </>
  );
}

/** The learner's photo in place of a nav icon; a ring in the current text colour marks it as the current page. */
function NavPhoto({ src, on }: { src: string; on: boolean }) {
  return <Avatar name="" src={src} className={cx("size-6", on && "ring-2 ring-current ring-offset-1 ring-offset-transparent")} iconClassName="size-4" />;
}

function SideLink({ item: l, on, photo }: { item: NavItem; on: boolean; photo?: string | null }) {
  return (
    <Link
      href={l.href}
      aria-current={on ? "page" : undefined}
      className={cx(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors active:scale-[0.98]",
        on ? "bg-sky-soft text-sky-ink" : "text-ink hover:bg-paper",
      )}
    >
      <span className={cx("grid size-8 shrink-0 place-items-center", on ? "text-sky-ink" : l.tone ? TONE[l.tone].ink : "text-muted")}>
        {photo ? <NavPhoto src={photo} on={on} /> : <l.icon className="size-[22px]" strokeWidth={2} />}
      </span>
      {l.label}
    </Link>
  );
}

const TAB = "relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.5rem] pb-1.5 pt-2 text-[10px] font-semibold transition-[color,transform] duration-200 active:scale-95";

function TabIcon({ icon: Icon, on, photo }: { icon: typeof House; on: boolean; photo?: string | null }) {
  return (
    <span className="grid h-6 place-items-center">
      {photo ? <NavPhoto src={photo} on={on} /> : <Icon className="size-6" strokeWidth={on ? 2.3 : 1.9} />}
    </span>
  );
}

function TabLink({ href, label, icon, on, photo }: { href: string; label: string; icon: typeof House; on: boolean; photo?: string | null }) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={cx(TAB, on ? "text-sky-ink" : "text-ink/70")}
    >
      <TabIcon icon={icon} on={on} photo={photo} />
      {label}
    </Link>
  );
}

