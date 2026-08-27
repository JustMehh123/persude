"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, LayoutList, Presentation, Scale as ScaleIcon, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { IntakeForm } from "@/components/pitch/IntakeForm";
import { HistorySidebar } from "@/components/pitch/HistorySidebar";
import { TalkingPointsView } from "@/components/pitch/TalkingPointsView";
import { ProposalView, proposalToPlainText } from "@/components/pitch/ProposalView";
import { DeckView } from "@/components/pitch/DeckView";
import { MatrixView } from "@/components/pitch/MatrixView";
import { ReadabilityPanel } from "@/components/pitch/ReadabilityPanel";
import {
  deletePitchRequest,
  getGeneratedPitchByRequestId,
  listPitchRequests,
  listStyleProfiles,
  listWritingSamples,
  saveGeneratedPitch,
  savePitchRequest,
} from "@/lib/db/dexie";
import { blendStyleProfiles } from "@/lib/style/analyzer";
import { inspectReadability } from "@/lib/style/humanizer";
import { generatePitch } from "@/lib/generator/pitchGenerator";
import { generateId } from "@/lib/utils";
import type {
  GeneratedPitch,
  OutputFormat,
  PitchRequest,
  WritingSample,
  WritingStyleProfile,
} from "@/lib/types";

function createEmptyRequest(): PitchRequest {
  const now = Date.now();
  return {
    id: generateId("request"),
    title: "",
    audience: "parent-guardian",
    audienceCustom: "",
    situation: "",
    desiredOutcome: "",
    constraints: "",
    compromiseIdeas: [],
    supportingFacts: [],
    strategy: "counter-proposal",
    tone: "empathetic-logical",
    styleSampleIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

const OUTPUT_TABS: { id: OutputFormat; label: string; icon: typeof LayoutList }[] = [
  { id: "talking-points", label: "Talking Points", icon: LayoutList },
  { id: "formal-proposal", label: "Proposal", icon: FileText },
  { id: "pitch-deck", label: "Pitch Deck", icon: Presentation },
  { id: "compromise-matrix", label: "Compromise Matrix", icon: ScaleIcon },
];

/**
 * Main dashboard: intake (voice/text + strategy + tone), document upload &
 * style analysis, multi-format generation, and the humanization inspector.
 */
export function PitchBuilder() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [request, setRequest] = useState<PitchRequest>(createEmptyRequest);
  const [samples, setSamples] = useState<WritingSample[]>([]);
  const [profiles, setProfiles] = useState<WritingStyleProfile[]>([]);
  const [savedRequests, setSavedRequests] = useState<PitchRequest[]>([]);
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitch | null>(null);
  const [activeTab, setActiveTab] = useState<OutputFormat>("talking-points");
  const [isGenerating, setIsGenerating] = useState(false);

  const refreshSamples = useCallback(async () => {
    const [nextSamples, nextProfiles] = await Promise.all([listWritingSamples(), listStyleProfiles()]);
    setSamples(nextSamples);
    setProfiles(nextProfiles);
  }, []);

  const refreshHistory = useCallback(async () => {
    setSavedRequests(await listPitchRequests());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([refreshSamples(), refreshHistory()]);
      if (!cancelled) setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSamples, refreshHistory]);

  const patchRequest = useCallback((patch: Partial<PitchRequest>) => {
    setRequest((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!request.situation.trim()) {
      toast.error("Describe the situation before generating a pitch.");
      return;
    }
    setIsGenerating(true);
    try {
      const selectedProfiles = profiles.filter((profile) => request.styleSampleIds.includes(profile.sampleId));
      const blended = blendStyleProfiles(selectedProfiles);
      const finalizedRequest: PitchRequest = { ...request, updatedAt: Date.now() };
      const pitch = generatePitch(finalizedRequest, blended);

      await savePitchRequest(finalizedRequest);
      await saveGeneratedPitch(pitch);

      setRequest(finalizedRequest);
      setGeneratedPitch(pitch);
      setActiveTab("talking-points");
      await refreshHistory();
      toast.success("Your pitch is ready across all formats.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong generating your pitch.");
    } finally {
      setIsGenerating(false);
    }
  }, [request, profiles, refreshHistory]);

  const handleSelectHistory = useCallback(async (id: string) => {
    const found = savedRequests.find((item) => item.id === id);
    if (!found) return;
    setRequest(found);
    const pitch = await getGeneratedPitchByRequestId(id);
    setGeneratedPitch(pitch ?? null);
    setActiveTab("talking-points");
  }, [savedRequests]);

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      await deletePitchRequest(id);
      await refreshHistory();
      if (request.id === id) {
        setRequest(createEmptyRequest());
        setGeneratedPitch(null);
      }
      toast.success("Deleted.");
    },
    [refreshHistory, request.id],
  );

  const handleNew = useCallback(() => {
    setRequest(createEmptyRequest());
    setGeneratedPitch(null);
    setActiveTab("talking-points");
  }, []);

  const handleSectionChange = useCallback(
    (sectionId: string, content: string) => {
      setGeneratedPitch((prev) => {
        if (!prev) return prev;
        const nextSections = prev.proposal.sections.map((section) =>
          section.id === sectionId ? { ...section, content } : section,
        );
        const nextProposal = { ...prev.proposal, sections: nextSections };
        const nextReadability = inspectReadability(proposalToPlainText(nextProposal));
        const next: GeneratedPitch = { ...prev, proposal: nextProposal, readability: nextReadability };
        void saveGeneratedPitch(next);
        return next;
      });
    },
    [],
  );

  const strategyLabel = useMemo(() => request.strategy, [request.strategy]);

  if (!isHydrated) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
        <p className="text-sm text-muted-foreground">Loading your local workspace…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
      <div className="space-y-6">
        <IntakeForm
          request={request}
          onChange={patchRequest}
          samples={samples}
          profiles={profiles}
          onRefreshSamples={refreshSamples}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        <HistorySidebar
          requests={savedRequests}
          activeId={generatedPitch?.requestId ?? null}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onNew={handleNew}
        />
      </div>

      <div className="space-y-6">
        {!generatedPitch ? (
          <Card className="flex min-h-[420px] flex-col items-center justify-center gap-3 border-dashed p-10 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-lg font-semibold">Your generated pitch will show up here</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Fill in the situation on the left, choose a strategy ({strategyLabel.replace("-", " ")}) and tone, then
              click &ldquo;Generate my pitch&rdquo; to produce talking points, a formal proposal, a slide deck, and a
              compromise matrix all at once.
            </p>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OutputFormat)}>
              <TabsList className="flex-wrap">
                {OUTPUT_TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="talking-points">
                <TalkingPointsView groups={generatedPitch.talkingPoints} pitchTitle={generatedPitch.requestTitle} />
              </TabsContent>
              <TabsContent value="formal-proposal">
                <ProposalView proposal={generatedPitch.proposal} onSectionChange={handleSectionChange} />
              </TabsContent>
              <TabsContent value="pitch-deck">
                <DeckView slides={generatedPitch.slides} pitchTitle={generatedPitch.requestTitle} />
              </TabsContent>
              <TabsContent value="compromise-matrix">
                <MatrixView options={generatedPitch.compromiseMatrix} />
              </TabsContent>
            </Tabs>

            <ReadabilityPanel report={generatedPitch.readability} />
          </>
        )}

        <Card>
          <CardContent className="flex items-start gap-3 p-4 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Everything on this page — your voice transcripts, uploaded documents, and generated pitches — is saved
              only in this browser&apos;s local IndexedDB storage. Nothing is sent to a server.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
