import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Gauge,
  Mic,
  Presentation,
  ScanText,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PITCH_STRATEGIES, TONE_STYLES } from "@/lib/generator/pitchGenerator";

const FEATURES = [
  {
    icon: Mic,
    title: "Voice or text intake",
    description:
      "Speak your side of the story using real-time voice-to-text, or type it out — either way, PersuadeAI captures the core of your ask.",
  },
  {
    icon: ScanText,
    title: "Document & style analyzer",
    description:
      "Upload PDFs, DOCX files, or plain text writing samples. PersuadeAI extracts sentence structure, vocabulary complexity, and tone so output sounds like you.",
  },
  {
    icon: SplitSquareHorizontal,
    title: "Four persuasive strategies",
    description:
      "Choose a respectful counter-proposal, a balanced discussion guide, a compromise matrix, or a data-backed presentation.",
  },
  {
    icon: Presentation,
    title: "Multi-format output",
    description:
      "Generate talking points for live conversation, a formal proposal document, and a slide-by-slide interactive pitch deck — all at once.",
  },
  {
    icon: Gauge,
    title: "Humanization & readability inspector",
    description:
      "Every draft is scored for sentence variety, natural phrasing, passive voice, and logical transitions — no robotic filler phrases.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Everything — your voice transcripts, documents, and generated pitches — is stored locally in your browser via IndexedDB. Nothing is uploaded.",
  },
];

const STEPS = [
  {
    title: "1. Describe the situation",
    description: "Speak or type the disagreement, your desired outcome, and any context the other person cares about.",
  },
  {
    title: "2. Pick a strategy & tone",
    description: "Choose how direct, formal, or data-driven you want to be — and optionally upload writing samples to match your voice.",
  },
  {
    title: "3. Generate & refine",
    description: "Get talking points, a formal proposal, and a pitch deck instantly, then polish with the readability inspector.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-grid-fade">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
            <Badge variant="outline" className="animate-in gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 100% local & open-source
            </Badge>
            <h1 className="animate-in max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Make your case — <span className="text-primary">respectfully</span>, clearly, and persuasively.
            </h1>
            <p className="animate-in max-w-2xl text-pretty text-lg text-muted-foreground">
              PersuadeAI helps you turn a curfew argument, a raise request, or a deadline extension into a
              well-reasoned proposal, discussion guide, or pitch deck — in your own voice.
            </p>
            <div className="animate-in flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/editor">
                  Start building your pitch <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to make your case</h2>
            <p className="mt-2 text-muted-foreground">From raw thought to polished pitch, entirely in your browser.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Three steps to a better conversation</h2>
                <p className="mt-3 text-muted-foreground">
                  No blank page anxiety. PersuadeAI structures your thinking and drafts every format you need.
                </p>
                <div className="mt-8 space-y-6">
                  {STEPS.map((step) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Choose your strategy</CardTitle>
                  <CardDescription>Four proven frameworks for negotiating personal agreements.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {PITCH_STRATEGIES.map((strategy) => (
                    <div key={strategy.id} className="rounded-xl border border-border bg-background p-4">
                      <p className="text-sm font-semibold">{strategy.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{strategy.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Speak in whatever tone fits the room</h2>
            <p className="mt-2 text-muted-foreground">Match your natural voice or the audience&apos;s expectations.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TONE_STYLES.map((tone) => (
              <div key={tone.id} className="rounded-xl border border-border p-5">
                <FileText className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold">{tone.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to make your case?</h2>
              <p className="max-w-lg text-primary-foreground/85">
                Everything runs locally — jump into the editor and generate your first pitch in under two minutes.
              </p>
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link href="/editor">
                  Open the Pitch Builder <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PersuadeAI. Open source under the MIT License.</p>
          <div className="flex gap-4">
            <Link href="/editor" className="hover:text-foreground">
              Pitch Builder
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
