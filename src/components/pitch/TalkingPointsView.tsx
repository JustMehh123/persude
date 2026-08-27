"use client";

import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copyTextToClipboard, downloadTextFile } from "@/lib/export";
import type { TalkingPointGroup } from "@/lib/types";

interface TalkingPointsViewProps {
  groups: TalkingPointGroup[];
  pitchTitle: string;
}

function toPlainText(groups: TalkingPointGroup[], title: string): string {
  const lines = [title, "=".repeat(title.length), ""];
  for (const group of groups) {
    lines.push(group.heading);
    for (const point of group.points) {
      lines.push(`  • ${point}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function TalkingPointsView({ groups, pitchTitle }: TalkingPointsViewProps) {
  const plainText = toPlainText(groups, pitchTitle);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Concise bullets for a live, spoken conversation.</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={async () => {
              const ok = await copyTextToClipboard(plainText);
              toast[ok ? "success" : "error"](ok ? "Copied talking points to clipboard." : "Copy failed.");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => downloadTextFile(`${pitchTitle || "talking-points"}.txt`, plainText)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{group.heading}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {group.points.map((point, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
