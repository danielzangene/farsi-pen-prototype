"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Exams now lives in Profile, so the old Exams page sends people there.
 * Kept as a page (not deleted) so bookmarks don't 404 on the static export.
 */
export default function ExamsRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/app/settings/"), [router]);
  return null;
}
