"use client";

import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompromiseEffort, CompromiseOption } from "@/lib/types";

interface MatrixViewProps {
  options: CompromiseOption[];
}

const EFFORT_VARIANT: Record<CompromiseEffort, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export function MatrixView({ options }: MatrixViewProps) {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Scale className="h-4 w-4" /> Concrete trade-offs, ranked by how much effort/change each requires.
      </p>
      <div className="grid gap-3">
        {options.map((option) => (
          <Card key={option.id}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold">{option.label}</p>
                  <Badge variant={EFFORT_VARIANT[option.effortLevel]}>{option.effortLevel} effort</Badge>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-xs font-medium text-muted-foreground">Their benefit</p>
                    <p>{option.theirBenefit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-xs font-medium text-muted-foreground">Your benefit</p>
                    <p>{option.yourBenefit}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
