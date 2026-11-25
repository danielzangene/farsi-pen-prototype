"use client";
import ProfileContent from "@/components/ProfileContent";
import { PageHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" />
      <ProfileContent />
    </div>
  );
}
