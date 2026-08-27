import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PitchBuilder } from "@/components/PitchBuilder";

export const metadata: Metadata = {
  title: "Pitch Builder — PersuadeAI",
  description: "Build talking points, a formal proposal, and a pitch deck for your next negotiation.",
};

export default function EditorPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PitchBuilder />
    </div>
  );
}
