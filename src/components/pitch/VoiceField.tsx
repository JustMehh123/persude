"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/** A textarea augmented with real-time voice dictation via the Web Speech API. */
export function VoiceField({ id, value, onChange, placeholder, rows = 4 }: VoiceFieldProps) {
  const voice = useVoiceInput({
    onFinalChunk: (chunk) => {
      onChange(`${value}${value.trim() ? " " : ""}${chunk}`);
    },
  });

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="pr-12"
        />
        <Button
          type="button"
          size="icon"
          variant={voice.isListening ? "destructive" : "outline"}
          className="absolute right-2 top-2 h-8 w-8"
          onClick={() => (voice.isListening ? voice.stop() : voice.start())}
          title={voice.isSupported ? "Dictate with your microphone" : "Voice input not supported in this browser"}
          aria-pressed={voice.isListening}
        >
          {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      {voice.isListening && (
        <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground")}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          Listening… {voice.interimTranscript && <em className="not-italic text-foreground/70">"{voice.interimTranscript}"</em>}
        </p>
      )}
      {voice.error && <p className="text-xs text-destructive">{voice.error}</p>}
    </div>
  );
}
