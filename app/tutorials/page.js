"use client";

import TutorialsHubContent from "@/components/TutorialsHubContent";

/** Public tutorials entry — same experience as the signed-in dashboard hub. */
export default function TutorialsPage() {
  return (
    <div className="min-h-screen">
      <TutorialsHubContent />
    </div>
  );
}
