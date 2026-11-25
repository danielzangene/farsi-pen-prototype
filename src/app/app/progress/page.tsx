"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Progress now lives in Profile, so the old Progress page sends people there.
 * Kept as a page (not deleted) so bookmarks don't 404 on the static export.
 */
export default function ProgressRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/app/settings/"), [router]);
  return null;
}
