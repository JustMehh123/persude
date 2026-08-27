"use client";

import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyTextToClipboard, downloadTextFile } from "@/lib/export";
import type { FormalProposal } from "@/lib/types";

interface ProposalViewProps {
  proposal: FormalProposal;
  onSectionChange: (sectionId: string, content: string) => void;
}

export function proposalToPlainText(proposal: FormalProposal): string {
  const lines = [proposal.title, "=".repeat(proposal.title.length), ""];
  for (const section of proposal.sections) {
    lines.push(section.heading);
    lines.push("-".repeat(section.heading.length));
    lines.push(section.content);
    lines.push("");
  }
  return lines.join("\n");
}

export function ProposalView({ proposal, onSectionChange }: ProposalViewProps) {
  const plainText = proposalToPlainText(proposal);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          A structured document you can send by email or message. Edit any section directly.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={async () => {
              const ok = await copyTextToClipboard(plainText);
              toast[ok ? "success" : "error"](ok ? "Copied proposal to clipboard." : "Copy failed.");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => downloadTextFile(`${proposal.title || "proposal"}.txt`, plainText)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{proposal.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {proposal.sections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{section.heading}</p>
              <Textarea
                value={section.content}
                onChange={(event) => onSectionChange(section.id, event.target.value)}
                rows={Math.min(10, Math.max(3, Math.ceil(section.content.length / 70)))}
                className="text-sm leading-relaxed"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
