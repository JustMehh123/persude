"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { downloadTextFile } from "@/lib/export";
import type { SlideContent } from "@/lib/types";

interface DeckViewProps {
  slides: SlideContent[];
  pitchTitle: string;
}

const SLIDE_TYPE_LABEL: Record<SlideContent["type"], string> = {
  title: "Title",
  problem: "Problem",
  solution: "Solution",
  benefits: "Benefits",
  compromise: "Compromise",
  data: "Data",
  closing: "Closing",
};

function slidesToPlainText(slides: SlideContent[]): string {
  return slides
    .map((slide, index) => {
      const lines = [`Slide ${index + 1}: ${slide.title}`, ...slide.bullets.map((bullet) => `  - ${bullet}`)];
      if (slide.speakerNotes) lines.push(`  Speaker notes: ${slide.speakerNotes}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

export function DeckView({ slides, pitchTitle }: DeckViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[Math.min(activeIndex, slides.length - 1)];

  if (!activeSlide) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Slide {activeIndex + 1} of {slides.length}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => downloadTextFile(`${pitchTitle || "pitch-deck"}.txt`, slidesToPlainText(slides))}
        >
          <Download className="h-3.5 w-3.5" /> Export outline
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex aspect-[16/9] flex-col justify-center gap-4 bg-gradient-to-br from-primary/10 via-background to-accent/20 p-8 sm:p-12">
          <Badge variant="outline" className="w-fit uppercase tracking-wide">
            {SLIDE_TYPE_LABEL[activeSlide.type]}
          </Badge>
          <h3 className="text-2xl font-bold sm:text-3xl">{activeSlide.title}</h3>
          <ul className="space-y-2">
            {activeSlide.bullets.map((bullet, index) => (
              <li key={index} className="flex gap-2 text-base text-foreground/90 sm:text-lg">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <CardContent className="flex items-start gap-2 border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{activeSlide.speakerNotes}</p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === activeIndex ? "bg-primary" : "bg-border",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setActiveIndex((index) => Math.min(slides.length - 1, index + 1))}
          disabled={activeIndex === slides.length - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
