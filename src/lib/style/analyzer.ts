/**
 * Writing style & tone analyzer.
 *
 * Pure, dependency-free text statistics used to fingerprint a writing
 * sample: sentence structure, vocabulary complexity, tone markers, and
 * readability. The resulting `WritingStyleProfile` is later blended into
 * pitch generation so outputs sound like the user, not a generic template.
 */
import type {
  BlendedStyleProfile,
  PunctuationProfile,
  ToneMarkerScores,
  WritingSample,
  WritingStyleProfile,
} from "@/lib/types";
import { generateId, round } from "@/lib/utils";

const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are aren't as at be because been before " +
    "being below between both but by can't cannot could couldn't did didn't do does doesn't doing don't " +
    "down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's " +
    "her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it " +
    "it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought " +
    "our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such " +
    "than that that's the their theirs them themselves then there there's these they they'd they'll " +
    "they're they've this those through to too under until up very was wasn't we we'd we'll we're we've " +
    "were weren't what what's when when's where where's which while who who's whom why why's with " +
    "won't would wouldn't you you'd you'll you're you've your yours yourself yourselves"
  ).split(/\s+/),
);

const ASSERTIVE_WORDS = [
  "must", "will", "need", "require", "clearly", "certainly", "definitely", "should",
  "have to", "expect", "insist", "commit", "guarantee", "ensure", "always", "never",
];

const EMPATHY_WORDS = [
  "understand", "appreciate", "respect", "feel", "feelings", "value", "recognize",
  "acknowledge", "grateful", "thankful", "hear you", "care", "trust", "support",
];

const HEDGING_WORDS = [
  "maybe", "perhaps", "possibly", "might", "could be", "i think", "i guess", "sort of",
  "kind of", "just wondering", "not sure", "probably", "seems like", "a little",
];

const TRANSITION_WORDS = [
  "however", "therefore", "additionally", "furthermore", "moreover", "in fact",
  "for example", "for instance", "on the other hand", "as a result", "in addition",
  "consequently", "meanwhile", "similarly", "in contrast", "specifically", "ultimately",
  "in short", "to that end", "that said",
];

const CONTRACTIONS_REGEX = /\b\w+'(?:t|re|ve|ll|d|s|m)\b/gi;

/** Split raw text into sentences, tolerating common abbreviations. */
export function splitSentences(text: string): string[] {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e)\./gi, "$1__ABBR__")
    .trim();

  if (!cleaned) return [];

  const rawSentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/)
    .map((sentence) => sentence.replace(/__ABBR__/g, ".").trim())
    .filter((sentence) => sentence.length > 0);

  // Fallback: if punctuation-based split produced a single giant blob but
  // there are clearly multiple sentence-ending marks, split more loosely.
  if (rawSentences.length <= 1 && /[.!?]/.test(cleaned)) {
    return cleaned
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  return rawSentences;
}

/** Tokenize text into lowercase word tokens (letters, digits, apostrophes). */
export function tokenizeWords(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9']+/g);
  return matches ?? [];
}

/** Heuristic syllable counter (vowel-group based, tuned for English prose). */
export function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return 0;
  if (normalized.length <= 3) return 1;

  const trimmed = normalized
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escaped}\\b`, "gi");
  return (haystack.match(pattern) ?? []).length;
}

function computeToneMarkers(text: string, wordCount: number): ToneMarkerScores {
  const lower = text.toLowerCase();
  const per100 = (count: number) => (wordCount > 0 ? (count / wordCount) * 100 : 0);

  const assertiveHits = ASSERTIVE_WORDS.reduce((sum, phrase) => sum + countOccurrences(lower, phrase), 0);
  const empathyHits = EMPATHY_WORDS.reduce((sum, phrase) => sum + countOccurrences(lower, phrase), 0);
  const hedgingHits = HEDGING_WORDS.reduce((sum, phrase) => sum + countOccurrences(lower, phrase), 0);

  const contractionsCount = (lower.match(CONTRACTIONS_REGEX) ?? []).length;
  const longWordCount = tokenizeWords(text).filter((word) => word.length >= 7).length;
  const formalityScore = clampScore(
    50 + per100(longWordCount) * 1.4 - per100(contractionsCount) * 2.2 - per100(hedgingHits) * 1.2,
  );

  return {
    formalityScore,
    assertivenessScore: clampScore(30 + per100(assertiveHits) * 9),
    empathyScore: clampScore(20 + per100(empathyHits) * 10),
    hedgingScore: clampScore(10 + per100(hedgingHits) * 11),
  };
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, round(value, 0)));
}

function computePunctuationProfile(text: string, wordCount: number): PunctuationProfile {
  const per100 = (count: number) => (wordCount > 0 ? round((count / wordCount) * 100, 2) : 0);
  return {
    commasPer100Words: per100((text.match(/,/g) ?? []).length),
    semicolonsPer100Words: per100((text.match(/;/g) ?? []).length),
    exclamationsPer100Words: per100((text.match(/!/g) ?? []).length),
    questionsPer100Words: per100((text.match(/\?/g) ?? []).length),
  };
}

function topFrequentWords(words: string[], limit: number): string[] {
  const freq = new Map<string, number>();
  for (const word of words) {
    if (word.length < 5 || STOPWORDS.has(word) || /^\d+$/.test(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

function commonSentenceStarters(sentences: string[], limit: number): string[] {
  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    const firstWord = tokenizeWords(sentence)[0];
    if (!firstWord) continue;
    freq.set(firstWord, (freq.get(firstWord) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function detectSignatureTransitions(text: string): string[] {
  const lower = text.toLowerCase();
  return TRANSITION_WORDS.filter((phrase) => countOccurrences(lower, phrase) > 0);
}

function standardDeviation(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function sentenceLengthBucket(avg: number): "short" | "medium" | "long" {
  if (avg <= 12) return "short";
  if (avg <= 22) return "medium";
  return "long";
}

/**
 * Analyze a single writing sample and produce a full style profile.
 * This is the core algorithm behind the Document & Style Analyzer.
 */
export function analyzeWritingSample(sample: WritingSample): WritingStyleProfile {
  const text = sample.rawText.trim();
  const sentences = splitSentences(text);
  const words = tokenizeWords(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  const sentenceLengths = sentences.map((sentence) => tokenizeWords(sentence).length || 1);
  const avgSentenceLength = wordCount > 0 ? wordCount / sentenceCount : 0;
  const sentenceLengthStdDev = standardDeviation(
    sentenceLengths,
    sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(1, sentenceLengths.length),
  );

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;
  const complexWordCount = words.filter((word) => countSyllables(word) >= 3).length;
  const vocabularyComplexity = wordCount > 0 ? round((complexWordCount / wordCount) * 100, 1) : 0;

  const fleschReadingEase =
    wordCount > 0 && sentenceCount > 0
      ? round(206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord, 1)
      : 0;
  const fleschKincaidGrade =
    wordCount > 0 && sentenceCount > 0
      ? round(0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59, 1)
      : 0;

  return {
    id: generateId("style"),
    sampleId: sample.id,
    sourceName: sample.name,
    sourceType: sample.sourceType,
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength: round(avgSentenceLength, 1),
    sentenceLengthStdDev: round(sentenceLengthStdDev, 1),
    avgSyllablesPerWord: round(avgSyllablesPerWord, 2),
    vocabularyComplexity,
    fleschReadingEase,
    fleschKincaidGrade,
    toneMarkers: computeToneMarkers(text, wordCount),
    topVocabulary: topFrequentWords(words, 12),
    commonSentenceStarters: commonSentenceStarters(sentences, 6),
    punctuationProfile: computePunctuationProfile(text, wordCount),
    signatureTransitions: detectSignatureTransitions(text),
    dominantSentenceLengthBucket: sentenceLengthBucket(avgSentenceLength),
    createdAt: Date.now(),
  };
}

/**
 * Blend multiple style profiles into a single average fingerprint that the
 * generator can use to imitate the user's overall voice across samples.
 */
export function blendStyleProfiles(profiles: WritingStyleProfile[]): BlendedStyleProfile | null {
  if (profiles.length === 0) return null;

  const count = profiles.length;
  const avg = (selector: (profile: WritingStyleProfile) => number) =>
    round(profiles.reduce((sum, profile) => sum + selector(profile), 0) / count, 2);

  const vocabulary = Array.from(new Set(profiles.flatMap((profile) => profile.topVocabulary))).slice(0, 16);
  const starters = Array.from(new Set(profiles.flatMap((profile) => profile.commonSentenceStarters))).slice(0, 8);
  const transitions = Array.from(new Set(profiles.flatMap((profile) => profile.signatureTransitions)));

  const avgSentenceLength = avg((profile) => profile.avgSentenceLength);

  return {
    sampleCount: count,
    wordCount: Math.round(avg((profile) => profile.wordCount)),
    sentenceCount: Math.round(avg((profile) => profile.sentenceCount)),
    avgSentenceLength,
    sentenceLengthStdDev: avg((profile) => profile.sentenceLengthStdDev),
    avgSyllablesPerWord: avg((profile) => profile.avgSyllablesPerWord),
    vocabularyComplexity: avg((profile) => profile.vocabularyComplexity),
    fleschReadingEase: avg((profile) => profile.fleschReadingEase),
    fleschKincaidGrade: avg((profile) => profile.fleschKincaidGrade),
    toneMarkers: {
      formalityScore: Math.round(avg((profile) => profile.toneMarkers.formalityScore)),
      assertivenessScore: Math.round(avg((profile) => profile.toneMarkers.assertivenessScore)),
      empathyScore: Math.round(avg((profile) => profile.toneMarkers.empathyScore)),
      hedgingScore: Math.round(avg((profile) => profile.toneMarkers.hedgingScore)),
    },
    topVocabulary: vocabulary,
    commonSentenceStarters: starters,
    punctuationProfile: {
      commasPer100Words: avg((profile) => profile.punctuationProfile.commasPer100Words),
      semicolonsPer100Words: avg((profile) => profile.punctuationProfile.semicolonsPer100Words),
      exclamationsPer100Words: avg((profile) => profile.punctuationProfile.exclamationsPer100Words),
      questionsPer100Words: avg((profile) => profile.punctuationProfile.questionsPer100Words),
    },
    signatureTransitions: transitions,
    dominantSentenceLengthBucket: sentenceLengthBucket(avgSentenceLength),
    createdAt: Date.now(),
  };
}

export const STYLE_ANALYZER_CONSTANTS = {
  STOPWORDS,
  ASSERTIVE_WORDS,
  EMPATHY_WORDS,
  HEDGING_WORDS,
  TRANSITION_WORDS,
};
