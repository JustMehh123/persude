"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { VoiceField } from "@/components/pitch/VoiceField";
import { TagListEditor } from "@/components/pitch/TagListEditor";
import { DocumentUploader } from "@/components/pitch/DocumentUploader";
import { AUDIENCES, PITCH_STRATEGIES, TONE_STYLES } from "@/lib/generator/pitchGenerator";
import type { PitchRequest, WritingSample, WritingStyleProfile } from "@/lib/types";

interface IntakeFormProps {
  request: PitchRequest;
  onChange: (patch: Partial<PitchRequest>) => void;
  samples: WritingSample[];
  profiles: WritingStyleProfile[];
  onRefreshSamples: () => Promise<void> | void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function IntakeForm({
  request,
  onChange,
  samples,
  profiles,
  onRefreshSamples,
  onGenerate,
  isGenerating,
}: IntakeFormProps) {
  const toggleSample = (id: string) => {
    const isSelected = request.styleSampleIds.includes(id);
    onChange({
      styleSampleIds: isSelected
        ? request.styleSampleIds.filter((sampleId) => sampleId !== id)
        : [...request.styleSampleIds, id],
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>1. What's the situation?</CardTitle>
          <CardDescription>Describe the disagreement or request in your own words — speak it or type it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Pitch title</Label>
            <Input
              id="title"
              value={request.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="e.g. Later weekend curfew"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="audience">Who are you talking to?</Label>
              <Select value={request.audience} onValueChange={(value) => onChange({ audience: value as PitchRequest["audience"] })}>
                <SelectTrigger id="audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((audience) => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {request.audience === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="audienceCustom">Describe them</Label>
                <Input
                  id="audienceCustom"
                  value={request.audienceCustom}
                  onChange={(event) => onChange({ audienceCustom: event.target.value })}
                  placeholder="e.g. my landlord"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="situation">The core disagreement or request</Label>
            <VoiceField
              id="situation"
              value={request.situation}
              onChange={(value) => onChange({ situation: value })}
              placeholder="e.g. My curfew is 9pm on weekends and I think that's too early for someone my age..."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desiredOutcome">What do you actually want to happen?</Label>
            <VoiceField
              id="desiredOutcome"
              value={request.desiredOutcome}
              onChange={(value) => onChange({ desiredOutcome: value })}
              placeholder="e.g. Move my curfew to 11pm on Friday and Saturday nights"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="constraints">Context they care about (their concerns, history, constraints)</Label>
            <VoiceField
              id="constraints"
              value={request.constraints}
              onChange={(value) => onChange({ constraints: value })}
              placeholder="e.g. They're worried about safety and me getting enough sleep for school"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Strategy & tone</CardTitle>
          <CardDescription>Choose the persuasive framework and voice for your pitch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="strategy">Strategy</Label>
            <Select value={request.strategy} onValueChange={(value) => onChange({ strategy: value as PitchRequest["strategy"] })}>
              <SelectTrigger id="strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PITCH_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {PITCH_STRATEGIES.find((strategy) => strategy.id === request.strategy)?.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tone">Tone / style</Label>
            <Select value={request.tone} onValueChange={(value) => onChange({ tone: value as PitchRequest["tone"] })}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_STYLES.map((tone) => (
                  <SelectItem key={tone.id} value={tone.id}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {TONE_STYLES.find((tone) => tone.id === request.tone)?.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Compromise ideas you're already open to</Label>
            <TagListEditor
              items={request.compromiseIdeas}
              onChange={(items) => onChange({ compromiseIdeas: items })}
              placeholder="e.g. A trial period for two weeks"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Supporting facts / evidence</Label>
            <TagListEditor
              items={request.supportingFacts}
              onChange={(items) => onChange({ supportingFacts: items })}
              placeholder="e.g. My grades have stayed above a B average this semester"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Match your writing style (optional)</CardTitle>
          <CardDescription>
            Upload notes, essays, or emails you've written. PersuadeAI analyzes sentence structure and tone to keep
            output in your voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploader
            samples={samples}
            profiles={profiles}
            selectedSampleIds={request.styleSampleIds}
            onToggleSample={toggleSample}
            onRefresh={onRefreshSamples}
          />
        </CardContent>
      </Card>

      <Button size="lg" className="w-full gap-2" onClick={onGenerate} disabled={isGenerating || !request.situation.trim()}>
        <Sparkles className="h-4 w-4" />
        {isGenerating ? "Generating…" : "Generate my pitch"}
      </Button>
    </div>
  );
}
