"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Journey now lives on Home, so the old Journey page sends people there.
 * Kept as a page (not deleted) so bookmarks don't 404 on the static export.
 */
export default function JourneyRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/app/"), [router]);
  return null;
}
