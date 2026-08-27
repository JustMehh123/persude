/**
 * Shared domain types for PersuadeAI.
 *
 * These interfaces are used across the parser, style analyzer, pitch
 * generator, humanization inspector, local database layer, and UI.
 */

/** High level persuasive strategy the generator should optimize for. */
export type PitchStrategy =
  | "counter-proposal"
  | "discussion-guide"
  | "compromise-matrix"
  | "data-presentation";

/** Tone / voice the generated language should be written in. */
export type ToneStyle =
  | "casual-direct"
  | "formal-structured"
  | "empathetic-logical"
  | "executive-summary";

/** The relationship / audience being pitched to. Influences phrasing. */
export type AudienceType =
  | "parent-guardian"
  | "manager-supervisor"
  | "teacher-professor"
  | "partner-roommate"
  | "client-stakeholder"
  | "custom";

/** Output artifacts the multi-format generator produces. */
export type OutputFormat = "talking-points" | "formal-proposal" | "pitch-deck" | "compromise-matrix";

export interface PitchStrategyOption {
  id: PitchStrategy;
  label: string;
  description: string;
}

export interface ToneStyleOption {
  id: ToneStyle;
  label: string;
  description: string;
}

export interface AudienceOption {
  id: AudienceType;
  label: string;
}

/** Raw intake captured from the user before generation. */
export interface PitchRequest {
  id: string;
  title: string;
  audience: AudienceType;
  audienceCustom: string;
  /** The core disagreement, ask, or situation, in the user's own words. */
  situation: string;
  /** What the user actually wants to happen. */
  desiredOutcome: string;
  /** Constraints, history, or context the other party cares about. */
  constraints: string;
  /** Bullet-style compromise ideas the user is already open to. */
  compromiseIdeas: string[];
  /** Bullet-style supporting facts / evidence / data points. */
  supportingFacts: string[];
  strategy: PitchStrategy;
  tone: ToneStyle;
  /** Ids of WritingStyleProfile records to blend into the voice. */
  styleSampleIds: string[];
  createdAt: number;
  updatedAt: number;
}

/** A writing sample uploaded/pasted by the user, stored locally. */
export interface WritingSample {
  id: string;
  name: string;
  sourceType: "pdf" | "docx" | "text" | "manual";
  rawText: string;
  createdAt: number;
}

/** Aggregated tone signal strengths, each roughly 0-100. */
export interface ToneMarkerScores {
  formalityScore: number;
  assertivenessScore: number;
  empathyScore: number;
  hedgingScore: number;
}

/** Punctuation usage fingerprints extracted from a sample. */
export interface PunctuationProfile {
  commasPer100Words: number;
  semicolonsPer100Words: number;
  exclamationsPer100Words: number;
  questionsPer100Words: number;
}

/** The output of the style & tone analyzer for a single writing sample. */
export interface WritingStyleProfile {
  id: string;
  sampleId: string;
  sourceName: string;
  sourceType: WritingSample["sourceType"];
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceLengthStdDev: number;
  avgSyllablesPerWord: number;
  vocabularyComplexity: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  toneMarkers: ToneMarkerScores;
  topVocabulary: string[];
  commonSentenceStarters: string[];
  punctuationProfile: PunctuationProfile;
  signatureTransitions: string[];
  dominantSentenceLengthBucket: "short" | "medium" | "long";
  createdAt: number;
}

/** A blended style profile computed across multiple writing samples. */
export interface BlendedStyleProfile extends Omit<WritingStyleProfile, "id" | "sampleId" | "sourceName" | "sourceType"> {
  sampleCount: number;
}

export interface TalkingPointGroup {
  id: string;
  heading: string;
  points: string[];
}

export interface ProposalSection {
  id: string;
  heading: string;
  content: string;
}

export interface FormalProposal {
  title: string;
  sections: ProposalSection[];
}

export type SlideType =
  | "title"
  | "problem"
  | "solution"
  | "benefits"
  | "compromise"
  | "data"
  | "closing";

export interface SlideContent {
  id: string;
  order: number;
  type: SlideType;
  title: string;
  bullets: string[];
  speakerNotes: string;
}

export type CompromiseEffort = "low" | "medium" | "high";

export interface CompromiseOption {
  id: string;
  label: string;
  theirBenefit: string;
  yourBenefit: string;
  effortLevel: CompromiseEffort;
}

export interface ReadabilityReport {
  overallScore: number;
  sentenceVarietyScore: number;
  naturalPhrasingScore: number;
  transitionScore: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  passiveVoiceRatio: number;
  transitionDensity: number;
  repetitiveOpeners: string[];
  clicheHits: string[];
  aiTellHits: string[];
  suggestions: string[];
}

/** Full generated deliverable set for a single PitchRequest. */
export interface GeneratedPitch {
  id: string;
  requestId: string;
  requestTitle: string;
  strategy: PitchStrategy;
  tone: ToneStyle;
  talkingPoints: TalkingPointGroup[];
  proposal: FormalProposal;
  slides: SlideContent[];
  compromiseMatrix: CompromiseOption[];
  readability: ReadabilityReport;
  createdAt: number;
}

export interface VoiceTranscriptState {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
}
