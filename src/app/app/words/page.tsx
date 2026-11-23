"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Words now live on My cards (review, saved words and Browse), so the old Words page
 * sends people there, keeping any query such as ?start=today. Kept as a page so
 * bookmarks don't 404 on the static export.
 */
export default function WordsRedirect() {
  const router = useRouter();
  useEffect(() => router.replace(`/app/bookmarks/${window.location.search}`), [router]);
  return null;
}
