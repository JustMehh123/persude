/**
 * Humanization & Readability Inspector.
 *
 * Evaluates any block of generated (or user-written) persuasive text for
 * sentence variety, natural phrasing, passive voice, logical transitions,
 * and telltale robotic/AI phrasing — then produces actionable suggestions
 * so the final pitch reads as authentically human.
 */
import type { ReadabilityReport } from "@/lib/types";
import { countSyllables, splitSentences, tokenizeWords } from "@/lib/style/analyzer";
import { clamp, round } from "@/lib/utils";

const TRANSITION_PHRASES = [
  "however", "therefore", "additionally", "furthermore", "moreover", "in fact",
  "for example", "for instance", "on the other hand", "as a result", "in addition",
  "consequently", "meanwhile", "similarly", "in contrast", "specifically",
  "ultimately", "in short", "that said", "to that end", "with that in mind",
  "because of this", "given this", "in turn",
];

const PASSIVE_REGEX =
  /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b|\b(am|is|are|was|were|be|been|being)\s+\w+en\b/gi;

const CLICHES = [
  "at the end of the day", "think outside the box", "low-hanging fruit",
  "synergy", "circle back", "touch base", "move the needle", "paradigm shift",
  "win-win", "best of both worlds", "it goes without saying", "needless to say",
  "in this day and age", "the fact of the matter is",
];

const AI_TELLS = [
  "in today's fast-paced world", "in conclusion, it is clear that", "as an ai",
  "i cannot", "delve into", "it is important to note that", "furthermore, it is evident",
  "unlock the full potential", "in the realm of", "navigating the complexities",
  "boasts a", "plays a pivotal role", "stands as a testament", "in summary,",
  "overall, it is evident", "a testament to", "seamlessly integrates",
];

function countPhraseHits(lowerText: string, phrases: string[]): string[] {
  return phrases.filter((phrase) => lowerText.includes(phrase));
}

function findRepetitiveOpeners(sentences: string[]): string[] {
  const openers = sentences.map((sentence) => tokenizeWords(sentence)[0] ?? "");
  const repeats: string[] = [];
  for (let i = 1; i < openers.length; i += 1) {
    if (openers[i] && openers[i] === openers[i - 1]) {
      repeats.push(openers[i]);
    }
  }
  return Array.from(new Set(repeats));
}

function passiveVoiceRatio(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const passiveCount = sentences.filter((sentence) => PASSIVE_REGEX.test(sentence)).length;
  // Reset regex lastIndex state (global flag) between test calls.
  PASSIVE_REGEX.lastIndex = 0;
  return round((passiveCount / sentences.length) * 100, 1);
}

function sentenceVarietyScore(sentences: string[]): number {
  if (sentences.length < 2) return 60;
  const lengths = sentences.map((sentence) => tokenizeWords(sentence).length || 1);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  // A healthy mix of short/medium/long sentences yields a stddev around
  // 35-55% of the mean length; too uniform (robotic) or too erratic both
  // score lower.
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
  const ideal = 0.45;
  const distance = Math.abs(coefficientOfVariation - ideal);
  return round(clamp(100 - distance * 140, 15, 100), 0);
}

function transitionDensity(text: string, sentenceCount: number): number {
  const lower = text.toLowerCase();
  const hits = TRANSITION_PHRASES.reduce((sum, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(escaped, "g"));
    return sum + (matches ? matches.length : 0);
  }, 0);
  return sentenceCount > 0 ? round((hits / sentenceCount) * 100, 1) : 0;
}

function naturalPhrasingScore(lowerText: string, sentences: string[]): number {
  let score = 100;
  const clicheHits = countPhraseHits(lowerText, CLICHES);
  const aiTellHits = countPhraseHits(lowerText, AI_TELLS);
  score -= clicheHits.length * 6;
  score -= aiTellHits.length * 9;

  // Overly uniform sentence starts read as templated/robotic.
  const repeats = findRepetitiveOpeners(sentences);
  score -= repeats.length * 4;

  // Extremely long, unbroken sentences also hurt naturalness.
  const longSentenceRatio =
    sentences.length > 0
      ? sentences.filter((sentence) => tokenizeWords(sentence).length > 34).length / sentences.length
      : 0;
  score -= longSentenceRatio * 30;

  return round(clamp(score, 0, 100), 0);
}

/**
 * Run the full humanization & readability inspection over a block of text
 * (e.g. a formal proposal draft, a talking-point script, or slide notes).
 */
export function inspectReadability(text: string): ReadabilityReport {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      overallScore: 0,
      sentenceVarietyScore: 0,
      naturalPhrasingScore: 0,
      transitionScore: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      passiveVoiceRatio: 0,
      transitionDensity: 0,
      repetitiveOpeners: [],
      clicheHits: [],
      aiTellHits: [],
      suggestions: ["Add some content to analyze readability and humanization."],
    };
  }

  const sentences = splitSentences(trimmed);
  const words = tokenizeWords(trimmed);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = wordCount / sentenceCount;
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  const fleschReadingEase = round(206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord, 1);
  const fleschKincaidGrade = round(0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59, 1);

  const lower = trimmed.toLowerCase();
  const clicheHits = countPhraseHits(lower, CLICHES);
  const aiTellHits = countPhraseHits(lower, AI_TELLS);
  const repeats = findRepetitiveOpeners(sentences);
  const passiveRatio = passiveVoiceRatio(sentences);
  const variety = sentenceVarietyScore(sentences);
  const density = transitionDensity(trimmed, sentenceCount);
  const naturalness = naturalPhrasingScore(lower, sentences);

  const transitionScore = round(clamp(density * 9, 0, 100), 0);
  const passivePenalty = clamp(passiveRatio * 0.8, 0, 35);

  const overallScore = round(
    clamp(
      variety * 0.3 + naturalness * 0.35 + transitionScore * 0.2 + (100 - passivePenalty) * 0.15,
      0,
      100,
    ),
    0,
  );

  const suggestions: string[] = [];
  if (variety < 60) {
    suggestions.push(
      "Vary your sentence lengths more — mix short, punchy statements with longer explanatory ones.",
    );
  }
  if (passiveRatio > 20) {
    suggestions.push(
      `About ${passiveRatio}% of sentences use passive voice. Rewrite key points in active voice (e.g. "I will finish the report" instead of "the report will be finished").`,
    );
  }
  if (density < 15) {
    suggestions.push(
      "Add more logical connectors (e.g. \"because\", \"as a result\", \"on the other hand\") so ideas flow instead of reading as a list of disconnected statements.",
    );
  }
  if (repeats.length > 0) {
    suggestions.push(
      `Several sentences in a row start with "${repeats[0]}". Reorder or rephrase openings for a more natural cadence.`,
    );
  }
  if (clicheHits.length > 0) {
    suggestions.push(`Consider replacing overused phrases: ${clicheHits.slice(0, 3).join(", ")}.`);
  }
  if (aiTellHits.length > 0) {
    suggestions.push(
      `Rephrase generic AI-sounding phrasing such as "${aiTellHits[0]}" with something specific to your situation.`,
    );
  }
  if (fleschKincaidGrade > 14) {
    suggestions.push(
      "This reads at a graduate-school reading level. Shorten sentences and swap in simpler words for a more conversational, persuasive tone.",
    );
  }
  if (suggestions.length === 0) {
    suggestions.push("This reads naturally with good variety and clear transitions. Nice work.");
  }

  return {
    overallScore,
    sentenceVarietyScore: variety,
    naturalPhrasingScore: naturalness,
    transitionScore,
    fleschReadingEase,
    fleschKincaidGrade,
    passiveVoiceRatio: passiveRatio,
    transitionDensity: density,
    repetitiveOpeners: repeats,
    clicheHits,
    aiTellHits,
    suggestions,
  };
}
