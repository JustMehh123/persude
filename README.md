# PersuadeAI

**PersuadeAI** is an open-source, privacy-first pitch builder and presentation generator. It helps you turn a
disagreement — a curfew, a raise request, a project deadline extension, a budget ask — into a well-reasoned,
respectful counter-proposal, discussion guide, compromise matrix, or full pitch deck, in your own voice.

Everything runs **entirely in your browser**. Voice transcripts, uploaded documents, and generated pitches are
stored locally via IndexedDB (Dexie.js) and are never uploaded to a server. There is no AI API key requirement —
the generation engine is a transparent, deterministic, template-driven algorithm you can read and audit yourself.

![PersuadeAI](https://img.shields.io/badge/license-MIT-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

- **Voice & text intake** — Dictate your situation with the Web Speech API or type it out. Works field-by-field
  across the situation, desired outcome, and context fields.
- **Strategy selector** — Choose from four persuasive frameworks:
  - *Respectful Counter-Proposal*
  - *Balanced Discussion Guide*
  - *Compromise Matrix*
  - *Data-Backed Presentation*
- **Tone & style customizer** — Casual & Direct, Formally Structured, Empathetic & Logical, or Executive Summary.
- **Document & style analyzer** (`src/lib/style/analyzer.ts`) — Upload PDFs, DOCX files, or plain text/Markdown
  writing samples (e.g. a Google Docs export). PersuadeAI extracts:
  - Sentence length distribution & standard deviation
  - Vocabulary complexity & syllables-per-word
  - Flesch Reading Ease / Flesch-Kincaid Grade Level
  - Tone markers: formality, assertiveness, empathy, hedging
  - Signature transitions, sentence starters, and punctuation habits
  - Multiple samples are blended into one style fingerprint used to flavor generated text.
- **Multi-format output generator** (`/editor`) — One click produces:
  - **Talking Points** — concise bullets for a live, spoken conversation
  - **Formal Proposal Document** — introduction, understanding of their side, the ask, supporting reasons,
    compromise options, and a closing (fully editable inline)
  - **Interactive Pitch Deck** — slide-by-slide (Title → Problem → Solution → Benefits → Compromise → Closing),
    with a slide navigator and speaker notes
  - **Compromise Matrix** — concrete trade-off options with effort level and benefit-to-each-side breakdown
- **Humanization & Readability Inspector** (`src/lib/style/humanizer.ts`) — Scores any draft for sentence variety,
  natural phrasing, passive voice, transition density, clichés, and AI-sounding "tells," with actionable
  suggestions.
- **Local-first storage** — Dexie.js/IndexedDB stores writing samples, style profiles, pitch requests, and
  generated pitches, with a history sidebar to revisit and delete past pitches.
- **Light & dark mode**, fully responsive, built with Tailwind CSS + shadcn-style components.

---

## 🧱 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4, Lucide Icons, shadcn-style Radix primitives |
| Voice intake | Web Speech API (`useVoiceInput` hook) |
| Document parsing | `pdfjs-dist` (PDF), `mammoth` (DOCX), native `FileReader` (TXT/MD) |
| Local storage | IndexedDB via Dexie.js |
| Style analysis | Custom NLP-lite heuristics (no external API) |
| Database (app scaffold) | PostgreSQL via Drizzle ORM — used only for the `/api/health` check |

> **Note:** PersuadeAI's core product does **not** require the PostgreSQL database — it exists only because this
> project was scaffolded from a Next.js + PostgreSQL starter template and exposes `/api/health`. All pitch-building
> features work fully offline with zero backend.

---

## 📁 Project Structure

```
src/
  app/
    page.tsx                 # Marketing/landing page
    editor/page.tsx           # The Pitch Builder dashboard
    api/health/route.ts       # Health check (Postgres)
  components/
    PitchBuilder.tsx          # Main dashboard: intake, upload, generation, deck
    pitch/                    # IntakeForm, DocumentUploader, VoiceField, output views, etc.
    ui/                       # shadcn-style primitives (button, card, tabs, dialog, ...)
  hooks/
    useVoiceInput.ts          # Web Speech API hook
  lib/
    parsers/docParser.ts      # PDF / DOCX / text extraction
    style/analyzer.ts         # Writing style & tone analyzer
    style/humanizer.ts        # Humanization & readability inspector
    generator/pitchGenerator.ts # Multi-format pitch generation engine
    db/dexie.ts                # IndexedDB (Dexie.js) local persistence
    types.ts                   # Shared TypeScript interfaces
```

---

## 🚀 Local Development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (only required for the `/api/health` route — see note above)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# edit .env and point DATABASE_URL at your local Postgres instance

# 3. Push the (empty) schema — only needed once
npx drizzle-kit push

# 4. Run the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the landing page, and
[http://localhost:3000/editor](http://localhost:3000/editor) for the Pitch Builder.

### Voice input notes

The Web Speech API (`SpeechRecognition`) is currently best supported in **Chrome and Edge**. In unsupported
browsers, the mic button is disabled and a message explains that typing still works perfectly.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |

---

## 🐳 Docker

A multi-stage `Dockerfile` and `docker-compose.yml` (app + Postgres) are included.

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

This starts a Postgres container and the PersuadeAI app on [http://localhost:3000](http://localhost:3000).

### Using the Dockerfile directly

```bash
docker build \
  --build-arg DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/app_db \
  -t persuadeai .

docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/app_db \
  persuadeai
```

---

## ▲ Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository.
3. Add an environment variable `DATABASE_URL` pointing to a managed Postgres instance (e.g.
   [Vercel Postgres](https://vercel.com/storage/postgres), [Neon](https://neon.tech), or
   [Supabase](https://supabase.com)).
4. Deploy — Vercel will automatically detect Next.js and run `npm run build`.
5. After the first deploy, run `npx drizzle-kit push` locally (pointed at the production `DATABASE_URL`) to sync the
   schema, or connect it via Vercel's CLI (`vercel env pull` then `npx drizzle-kit push`).

Because all pitch-building features are client-side, PersuadeAI works great on Vercel's free tier with zero
serverless function cold-start concerns for the core experience.

---

## 🔒 Privacy

PersuadeAI is designed so that the sensitive parts of your data — what you're arguing about, your writing samples,
and the pitches you generate — **never leave your device**. They are stored in your browser's IndexedDB via
Dexie.js. Clearing your browser data will remove them. There is no analytics, tracking, or third-party AI API call
involved in generating a pitch.

---

## 🤝 Contributing

Issues and pull requests are welcome! A few ideas for future contributions:

- Additional tone presets or industry-specific templates (e.g. sales negotiation, academic appeals)
- PDF/PPTX export for the pitch deck
- Additional language support for the style analyzer
- More sophisticated NLP for tone detection (e.g. sentiment scoring)

## 📄 License

Released under the [MIT License](./LICENSE).
