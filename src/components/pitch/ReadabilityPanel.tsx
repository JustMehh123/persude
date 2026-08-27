"use client";

import { Gauge, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ReadabilityReport } from "@/lib/types";

interface ReadabilityPanelProps {
  report: ReadabilityReport;
}

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

const METRICS: { key: keyof ReadabilityReport; label: string }[] = [
  { key: "sentenceVarietyScore", label: "Sentence variety" },
  { key: "naturalPhrasingScore", label: "Natural phrasing" },
  { key: "transitionScore", label: "Logical transitions" },
];

export function ReadabilityPanel({ report }: ReadabilityPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Humanization & Readability Inspector</CardTitle>
        </div>
        <CardDescription>How natural, varied, and persuasive your proposal reads.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Overall humanization score</span>
            <Badge variant={scoreVariant(report.overallScore)}>{report.overallScore}/100</Badge>
          </div>
          <Progress value={report.overallScore} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {METRICS.map((metric) => {
            const value = report[metric.key] as number;
            return (
              <div key={metric.key} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
                <Progress value={value} className="mt-2 h-1.5" />
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Flesch Reading Ease</p>
            <p className="text-base font-semibold">{report.fleschReadingEase}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Flesch-Kincaid Grade Level</p>
            <p className="text-base font-semibold">{report.fleschKincaidGrade}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Passive voice</p>
            <p className="text-base font-semibold">{report.passiveVoiceRatio}% of sentences</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Transition density</p>
            <p className="text-base font-semibold">{report.transitionDensity}%</p>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Suggestions
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
