"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TagListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

/** Small reusable editor for growable lists of short strings (facts, compromise ideas). */
export function TagListEditor({ items, onChange, placeholder }: TagListEditorProps) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="leading-snug">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={addItem} aria-label="Add item">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
