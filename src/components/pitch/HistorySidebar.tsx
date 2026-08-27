"use client";

import { History, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimestamp } from "@/lib/utils";
import { PITCH_STRATEGIES } from "@/lib/generator/pitchGenerator";
import type { PitchRequest } from "@/lib/types";

interface HistorySidebarProps {
  requests: PitchRequest[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function HistorySidebar({ requests, activeId, onSelect, onDelete, onNew }: HistorySidebarProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Saved pitches</CardTitle>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" /> New
        </Button>
      </CardHeader>
      <CardContent className="max-h-72 space-y-2 overflow-y-auto scrollbar-thin">
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Generate a pitch and it will appear here, stored locally on this device.
          </p>
        )}
        {requests.map((request) => (
          <button
            key={request.id}
            type="button"
            onClick={() => onSelect(request.id)}
            className={cn(
              "group flex w-full items-start justify-between gap-2 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted",
              activeId === request.id && "border-primary/60 bg-primary/5",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{request.title || "Untitled pitch"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {PITCH_STRATEGIES.find((strategy) => strategy.id === request.strategy)?.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{formatTimestamp(request.updatedAt)}</span>
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(request.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  onDelete(request.id);
                }
              }}
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Delete pitch"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
