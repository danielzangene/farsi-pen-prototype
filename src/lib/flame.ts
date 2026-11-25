"use client";
// Flames: the learner's reward balance, kept on their Supabase profile (profiles.flame, see
// supabase/migrations/20261125000000_profile_flame.sql). Every learner starts with 10, and once a day
// (UTC) they can claim 1–4 more. The database picks the amount and does the adding (claim_daily_flame);
// learners can't write the columns themselves, so this module only reads them and calls the claim.
//
// Flames are not part of the settings sync (profile-sync.ts) or of local progress: they always come from
// the server. Builds without sign-in have no flames ("off").
import { useSyncExternalStore } from "react";
import { AUTH_ENABLED, supabaseClient } from "./auth";
import { PROFILES_TABLE } from "./profile-row";

/** What a new profile starts with (the column default). */
export const STARTING_FLAMES = 10;

export interface FlameState {
  /** "off": no sign-in in this build, or signed out. "loading": first read on its way. "error": it failed. */
  status: "off" | "loading" | "ready" | "error";
  flame: number;
  /** UTC day (YYYY-MM-DD) of the last daily claim; null before the first. */
  claimedOn: string | null;
  /** True while a claim is on its way. */
  claiming: boolean;
  /** Flames added by the claim made during this visit, to show the result; null when none. */
  justGained: number | null;
}

const OFF: FlameState = { status: "off", flame: 0, claimedOn: null, claiming: false, justGained: null };

let state: FlameState = OFF;
let userId: string | null = null;
let started = false;
const listeners = new Set<() => void>();

function set(patch: Partial<FlameState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/** Today as the claim counts it: the UTC calendar day. */
export function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Whether today's flame can still be claimed (the server has the final say). */
export function canClaim(s: FlameState, now: Date = new Date()): boolean {
  return s.status === "ready" && !s.claiming && s.claimedOn !== utcDay(now);
}

async function load() {
  const id = userId;
  if (!id) return;
  const { data, error } = await supabaseClient()
    .from(PROFILES_TABLE)
    .select("flame, flame_claimed_on")
    .eq("id", id)
    .maybeSingle<{ flame: number; flame_claimed_on: string | null }>();
  if (id !== userId) return;
  if (error) {
    // Keep showing what we had; only a first read that fails counts as an error.
    if (state.status !== "ready") set({ status: "error" });
    return;
  }
  // No row yet (profile-sync.ts creates it): it will start with the column default.
  set({ status: "ready", flame: data?.flame ?? STARTING_FLAMES, claimedOn: data?.flame_claimed_on ?? null });
}

function start() {
  if (started || !AUTH_ENABLED) return;
  started = true;
  supabaseClient().auth.onAuthStateChange((_event, session) => {
    const id = session?.user.id ?? null;
    if (id === userId) return;
    userId = id;
    state = id ? { ...OFF, status: "loading" } : OFF;
    listeners.forEach((listener) => listener());
    // Supabase asks not to call it from inside this callback, so read on the next tick.
    if (id) setTimeout(() => void load(), 0);
  });
  // Another device may have claimed meanwhile: read again whenever the tab comes back.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void load();
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The signed-in learner's flames ("off" without sign-in, and while rendering on the server). */
export function useFlame(): FlameState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => OFF,
  );
}

/**
 * Claims today's flame. Returns how many were added: 1–4, or 0 if today's was already claimed
 * (on this or another device). Throws when the claim couldn't be made.
 */
export async function claimDailyFlame(): Promise<number> {
  const id = userId;
  if (!id || state.claiming) return 0;
  set({ claiming: true });
  const { data, error } = await supabaseClient()
    .rpc("claim_daily_flame")
    .maybeSingle<{ gained: number; total: number; claimed_on: string | null }>();
  if (id !== userId) return 0;
  if (error || !data) {
    set({ claiming: false });
    throw new Error(error?.message ?? "No profile to add flames to");
  }
  set({ claiming: false, flame: data.total, claimedOn: data.claimed_on, justGained: data.gained || null });
  return data.gained;
}
