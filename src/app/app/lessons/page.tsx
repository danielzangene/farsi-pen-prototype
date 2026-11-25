"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Every lesson is a Journey step on Home now, so the old Lessons index sends people there.
 * Kept as a page (not deleted) so bookmarks don't 404 on the static export.
 * Individual lessons still live at /app/lessons/<id>/.
 */
export default function LessonsRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/app/"), [router]);
  return null;
}
