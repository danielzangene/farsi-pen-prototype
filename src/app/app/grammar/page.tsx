"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Every grammar concept is a Journey step on Home now, so the old Grammar index sends people
 * there. Kept as a page so bookmarks don't 404 on the static export. Each concept still
 * lives at /app/grammar/<id>/.
 */
export default function GrammarRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/app/"), [router]);
  return null;
}
