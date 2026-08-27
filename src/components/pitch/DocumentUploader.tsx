"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { extractTextFromFiles, SUPPORTED_UPLOAD_EXTENSIONS } from "@/lib/parsers/docParser";
import { analyzeWritingSample } from "@/lib/style/analyzer";
import { deleteWritingSample, saveStyleProfile, saveWritingSample } from "@/lib/db/dexie";
import { generateId } from "@/lib/utils";
import type { WritingSample, WritingStyleProfile } from "@/lib/types";

interface DocumentUploaderProps {
  samples: WritingSample[];
  profiles: WritingStyleProfile[];
  selectedSampleIds: string[];
  onToggleSample: (id: string) => void;
  onRefresh: () => Promise<void> | void;
}

export function DocumentUploader({
  samples,
  profiles,
  selectedSampleIds,
  onToggleSample,
  onRefresh,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const profileFor = useCallback(
    (sampleId: string) => profiles.find((profile) => profile.sampleId === sampleId),
    [profiles],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      setIsProcessing(true);
      try {
        const { successes, failures } = await extractTextFromFiles(files);

        for (const parsed of successes) {
          if (!parsed.text) {
            toast.warning(`"${parsed.name}" had no extractable text and was skipped.`);
            continue;
          }
          const sample: WritingSample = {
            id: generateId("sample"),
            name: parsed.name,
            sourceType: parsed.sourceType,
            rawText: parsed.text,
            createdAt: Date.now(),
          };
          const profile = analyzeWritingSample(sample);
          await saveWritingSample(sample);
          await saveStyleProfile(profile);
          if (parsed.warnings.length > 0) {
            toast.info(`"${parsed.name}": ${parsed.warnings[0]}`);
          }
        }

        for (const failure of failures) {
          toast.error(`Couldn't read "${failure.name}": ${failure.error}`);
        }

        if (successes.some((doc) => doc.text)) {
          toast.success(`Analyzed ${successes.filter((doc) => doc.text).length} writing sample(s).`);
        }

        await onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to process uploaded files.");
      } finally {
        setIsProcessing(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onRefresh],
  );

  const handlePastedText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const sample: WritingSample = {
        id: generateId("sample"),
        name: `Pasted note — ${new Date().toLocaleTimeString()}`,
        sourceType: "manual",
        rawText: text,
        createdAt: Date.now(),
      };
      const profile = analyzeWritingSample(sample);
      await saveWritingSample(sample);
      await saveStyleProfile(profile);
      toast.success("Writing sample saved for style analysis.");
      await onRefresh();
    },
    [onRefresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteWritingSample(id);
      await onRefresh();
    },
    [onRefresh],
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer.files) void handleFiles(event.dataTransfer.files);
        }}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Drag & drop writing samples here</p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, TXT, or Markdown — used to learn your sentence structure and tone.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Choose files
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              const text = window.prompt("Paste a writing sample (an email, essay, or message you've written):");
              if (text) void handlePastedText(text);
            }}
          >
            Paste text instead
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={SUPPORTED_UPLOAD_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
          }}
        />
      </div>

      {samples.length > 0 && (
        <ul className="space-y-2">
          {samples.map((sample) => {
            const profile = profileFor(sample.id);
            const isSelected = selectedSampleIds.includes(sample.id);
            return (
              <li
                key={sample.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                  isSelected && "border-primary/60 bg-primary/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggleSample(sample.id)}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                  aria-pressed={isSelected}
                  title={isSelected ? "Included in style blend" : "Not used — click to include"}
                >
                  <FileText className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{sample.name}</p>
                    <Badge variant="outline" className="uppercase">
                      {sample.sourceType}
                    </Badge>
                    {isSelected && <Badge variant="success">Using for style</Badge>}
                  </div>
                  {profile && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile.wordCount} words · avg {profile.avgSentenceLength} words/sentence · reading ease{" "}
                      {profile.fleschReadingEase} · formality {profile.toneMarkers.formalityScore}/100
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(sample.id)}
                  className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${sample.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
