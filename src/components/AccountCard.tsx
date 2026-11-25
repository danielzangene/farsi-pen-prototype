"use client";
import { useState } from "react";
import { AUTH_ENABLED, signOut, useAuth } from "@/lib/auth";
import { Collapsible } from "@/components/ui";

/** Who is signed in, and a way out (to the landing page). Only shown when the build has sign-in; starts closed. */
export function AccountCard() {
  const { user } = useAuth();
  const [leaving, setLeaving] = useState(false);
  if (!AUTH_ENABLED || !user) return null;

  return (
    <Collapsible id="account" title="Account">
      <p className="text-sm font-semibold text-muted">
        Signed in with Google as <span className="break-all text-ink">{user.email}</span>
      </p>
      <button
        type="button"
        className="btn-secondary mt-4"
        disabled={leaving}
        onClick={() => {
          setLeaving(true);
          void signOut();
        }}
      >
        {leaving ? "Signing out…" : "Sign out"}
      </button>
    </Collapsible>
  );
}
