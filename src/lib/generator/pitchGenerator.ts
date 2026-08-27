/**
 * Multi-format persuasive pitch generator.
 *
 * Turns a `PitchRequest` (plus an optional blended writing-style profile)
 * into talking points, a formal proposal document, an interactive slide
 * deck, and a compromise matrix — all phrased according to the chosen
 * strategy and tone. Fully deterministic, template-driven, and runs
 * entirely client-side (no external AI API required).
 */
import type {
  AudienceOption,
  AudienceType,
  BlendedStyleProfile,
  CompromiseEffort,
  CompromiseOption,
  FormalProposal,
  GeneratedPitch,
  PitchRequest,
  PitchStrategy,
  PitchStrategyOption,
  ProposalSection,
  SlideContent,
  TalkingPointGroup,
  ToneStyle,
  ToneStyleOption,
} from "@/lib/types";
import { inspectReadability } from "@/lib/style/humanizer";
import { generateId } from "@/lib/utils";

export const PITCH_STRATEGIES: PitchStrategyOption[] = [
  {
    id: "counter-proposal",
    label: "Respectful Counter-Proposal",
    description: "Politely push back with a clear, alternative ask backed by reasoning.",
  },
  {
    id: "discussion-guide",
    label: "Balanced Discussion Guide",
    description: "A guided conversation framework with questions that invite dialogue, not confrontation.",
  },
  {
    id: "compromise-matrix",
    label: "Compromise Matrix",
    description: "Lay out concrete trade-off options so both sides can pick a middle ground together.",
  },
  {
    id: "data-presentation",
    label: "Data-Backed Presentation",
    description: "Lead with evidence and measurable outcomes to make the case objectively.",
  },
];

export const TONE_STYLES: ToneStyleOption[] = [
  {
    id: "casual-direct",
    label: "Casual & Direct",
    description: "Short sentences, plain language, gets to the point fast.",
  },
  {
    id: "formal-structured",
    label: "Formally Structured",
    description: "Polished, organized, and precise — suited for written documents.",
  },
  {
    id: "empathetic-logical",
    label: "Empathetic & Logical",
    description: "Leads with understanding, then backs it up with clear reasoning.",
  },
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "Crisp, outcome-first language, as if briefing a busy decision-maker.",
  },
];

export const AUDIENCES: AudienceOption[] = [
  { id: "parent-guardian", label: "Parent / Guardian" },
  { id: "manager-supervisor", label: "Manager / Supervisor" },
  { id: "teacher-professor", label: "Teacher / Professor" },
  { id: "partner-roommate", label: "Partner / Roommate" },
  { id: "client-stakeholder", label: "Client / Stakeholder" },
  { id: "custom", label: "Someone else" },
];

const AUDIENCE_REFERENCE: Record<AudienceType, string> = {
  "parent-guardian": "my parents",
  "manager-supervisor": "my manager",
  "teacher-professor": "my instructor",
  "partner-roommate": "my roommate",
  "client-stakeholder": "the stakeholders",
  custom: "them",
};

interface TonePhraseBank {
  opener: string[];
  understandingLeadIn: string[];
  connector: string[];
  askLeadIn: string[];
  compromiseLeadIn: string[];
  closer: string[];
  sentenceCase: (sentence: string) => string;
}

const TONE_BANKS: Record<ToneStyle, TonePhraseBank> = {
  "casual-direct": {
    opener: ["Hey — I want to talk through something.", "Quick thing I've been thinking about.", "Let's talk about"],
    understandingLeadIn: ["I get why", "Makes sense that", "Totally fair that"],
    connector: ["Also,", "On top of that,", "Plus,"],
    askLeadIn: ["Here's what I'd like to do instead:", "So here's my ask:", "What I'm proposing is simple:"],
    compromiseLeadIn: ["If that's a stretch, here's a middle ground:", "Happy to meet in the middle:", "Totally open to adjusting, like:"],
    closer: ["Let me know what you think.", "Can we find 10 minutes to talk about it?", "No pressure — just wanted to put it on the table."],
    sentenceCase: (sentence) => sentence,
  },
  "formal-structured": {
    opener: ["I would like to formally raise a topic for discussion.", "I am writing to propose a change regarding", "I would like to bring forward a request concerning"],
    understandingLeadIn: ["I recognize that", "I acknowledge that", "It is understandable that"],
    connector: ["Furthermore,", "In addition,", "Moreover,"],
    askLeadIn: ["My proposal is as follows:", "I would like to formally propose the following:", "Accordingly, my request is:"],
    compromiseLeadIn: ["Should adjustments be necessary, I would welcome the following alternatives:", "I am prepared to consider the following compromises:", "To ensure this is workable for both parties, I propose these alternatives:"],
    closer: ["I welcome the opportunity to discuss this further at your convenience.", "I would appreciate the chance to review this together.", "Thank you for considering this request."],
    sentenceCase: (sentence) => sentence,
  },
  "empathetic-logical": {
    opener: ["I've been thinking carefully about how to bring this up, because I value how we work together.", "I want to start by saying I understand where you're coming from on this.", "Before anything else, I want to acknowledge your perspective on"],
    understandingLeadIn: ["I really do understand that", "I can see why", "It makes complete sense that"],
    connector: ["At the same time,", "That said,", "With that in mind,"],
    askLeadIn: ["Taking that into account, here's what I'd like to propose:", "Balancing both of our needs, my ask is this:", "So with your concerns in mind, here's what I think could work:"],
    compromiseLeadIn: ["Because I want this to work for both of us, I'm open to:", "To respect your concerns, here are a few ways we could compromise:", "If it helps, I'd genuinely be glad to consider:"],
    closer: ["I really appreciate you hearing me out on this.", "I'm open to talking this through in whatever way feels most comfortable for you.", "Thank you for taking the time to consider my perspective."],
    sentenceCase: (sentence) => sentence,
  },
  "executive-summary": {
    opener: ["Summary: I'm requesting a change to", "Bottom line up front:", "Objective:"],
    understandingLeadIn: ["Context:", "Background:", "Current constraint:"],
    connector: ["Additionally:", "Key driver:", "Supporting factor:"],
    askLeadIn: ["Recommendation:", "Proposed action:", "Ask:"],
    compromiseLeadIn: ["Fallback options:", "Alternative paths if needed:", "Contingency options:"],
    closer: ["Next step: a brief decision or 10-minute discussion.", "Requesting a decision or follow-up conversation this week.", "Awaiting your sign-off or feedback."],
    sentenceCase: (sentence) => sentence,
  },
};

function pick<T>(items: T[], seed: number): T {
  if (items.length === 0) throw new Error("Cannot pick from an empty array");
  return items[Math.abs(seed) % items.length];
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function audienceLabel(request: PitchRequest): string {
  if (request.audience === "custom" && request.audienceCustom.trim()) {
    return request.audienceCustom.trim();
  }
  return AUDIENCE_REFERENCE[request.audience];
}

function cleanSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const capitalized = trimmed[0].toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function listToClause(items: string[], joiner = "and"): string {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} ${joiner} ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, ${joiner} ${cleaned[cleaned.length - 1]}`;
}

function applyStyleFlavor(sentence: string, style: BlendedStyleProfile | null): string {
  if (!style) return sentence;
  // Nudge toward the user's real vocabulary/punctuation habits without
  // corrupting grammar: prefer semicolons if the user's own writing uses
  // them often, and avoid tacking on extra exclamation marks if their
  // baseline sample rarely uses them.
  let flavored = sentence;
  if (style.punctuationProfile.exclamationsPer100Words < 0.2) {
    flavored = flavored.replace(/!+$/g, ".");
  }
  return flavored;
}

/** Builds the intro / framing talking points and proposal opening. */
function buildOpening(request: PitchRequest, bank: TonePhraseBank): string {
  const audience = audienceLabel(request);
  const opener = pick(bank.opener, hashString(request.id + "opener"));
  const situation = cleanSentence(request.situation);
  return `${opener} ${situation}`.trim();
}

function buildUnderstandingLine(request: PitchRequest, bank: TonePhraseBank): string {
  if (!request.constraints.trim()) return "";
  const leadIn = pick(bank.understandingLeadIn, hashString(request.id + "understand"));
  return `${leadIn} ${request.constraints.trim().replace(/\.$/, "")}.`;
}

function buildAskLine(request: PitchRequest, bank: TonePhraseBank): string {
  const leadIn = pick(bank.askLeadIn, hashString(request.id + "ask"));
  return `${leadIn} ${cleanSentence(request.desiredOutcome)}`;
}

function buildSupportingFactsSentence(request: PitchRequest, bank: TonePhraseBank): string {
  if (request.supportingFacts.length === 0) return "";
  const connector = pick(bank.connector, hashString(request.id + "facts"));
  return `${connector} ${listToClause(request.supportingFacts)}.`;
}

function buildCompromiseSentence(request: PitchRequest, bank: TonePhraseBank): string {
  if (request.compromiseIdeas.length === 0) return "";
  const leadIn = pick(bank.compromiseLeadIn, hashString(request.id + "compromise"));
  return `${leadIn} ${listToClause(request.compromiseIdeas, "or")}.`;
}

function buildCloser(request: PitchRequest, bank: TonePhraseBank): string {
  return pick(bank.closer, hashString(request.id + "closer"));
}

function strategyFramingLine(strategy: PitchStrategy, audience: string): string {
  switch (strategy) {
    case "counter-proposal":
      return `Rather than leaving things as they are, I'd like to offer a specific alternative for ${audience} to consider.`;
    case "discussion-guide":
      return `My goal here isn't to win an argument — it's to have an open conversation with ${audience} so we land somewhere that works for everyone.`;
    case "compromise-matrix":
      return `I've laid out a few concrete options below so ${audience} and I can pick the trade-off that feels fairest.`;
    case "data-presentation":
      return `I've backed this up with specific evidence so ${audience} can evaluate it objectively rather than just taking my word for it.`;
    default:
      return "";
  }
}

/** Generate the "Talking Points" output: concise bullets for live discussion. */
export function generateTalkingPoints(
  request: PitchRequest,
  style: BlendedStyleProfile | null = null,
): TalkingPointGroup[] {
  const bank = TONE_BANKS[request.tone];
  const audience = audienceLabel(request);
  const groups: TalkingPointGroup[] = [];

  groups.push({
    id: generateId("tp"),
    heading: "Open the conversation",
    points: [applyStyleFlavor(buildOpening(request, bank), style), strategyFramingLine(request.strategy, audience)].filter(
      Boolean,
    ),
  });

  const understandingLine = buildUnderstandingLine(request, bank);
  groups.push({
    id: generateId("tp"),
    heading: `Show you understand ${audience}'s side`,
    points: [
      understandingLine || `Acknowledge ${audience}'s current position or concern before making your ask.`,
      "Pause here and let them respond before moving to your ask — this isn't a monologue.",
    ],
  });

  groups.push({
    id: generateId("tp"),
    heading: "Make your ask clearly",
    points: [
      applyStyleFlavor(buildAskLine(request, bank), style),
      buildSupportingFactsSentence(request, bank) || "Have one or two concrete reasons ready in case they ask 'why now?'",
    ].filter(Boolean),
  });

  if (request.strategy === "compromise-matrix" || request.compromiseIdeas.length > 0) {
    groups.push({
      id: generateId("tp"),
      heading: "Offer flexibility",
      points: [
        buildCompromiseSentence(request, bank) ||
          "Offer a smaller version of your ask as a trial period if they hesitate on the full request.",
        "Ask them directly: \"Which of these would feel most reasonable to you?\"",
      ],
    });
  }

  if (request.strategy === "data-presentation" && request.supportingFacts.length > 0) {
    groups.push({
      id: generateId("tp"),
      heading: "Back it up with evidence",
      points: request.supportingFacts.map((fact) => cleanSentence(fact)),
    });
  }

  if (request.strategy === "discussion-guide") {
    groups.push({
      id: generateId("tp"),
      heading: "Questions to invite dialogue",
      points: [
        `What would need to be true for you to feel comfortable saying yes to this?`,
        `Is there a version of this that would work better for you?`,
        `What's the biggest concern on your end that I should address?`,
      ],
    });
  }

  groups.push({
    id: generateId("tp"),
    heading: "Close with a clear next step",
    points: [buildCloser(request, bank), "Suggest a specific follow-up: a date to revisit, a trial period, or a decision deadline."],
  });

  return groups;
}

/** Generate the "Formal Proposal Document" output. */
export function generateFormalProposal(
  request: PitchRequest,
  style: BlendedStyleProfile | null = null,
): FormalProposal {
  const bank = TONE_BANKS[request.tone];
  const audience = audienceLabel(request);
  const sections: ProposalSection[] = [];

  sections.push({
    id: generateId("sec"),
    heading: "Introduction",
    content: [applyStyleFlavor(buildOpening(request, bank), style), strategyFramingLine(request.strategy, audience)]
      .filter(Boolean)
      .join(" "),
  });

  const understandingLine = buildUnderstandingLine(request, bank);
  sections.push({
    id: generateId("sec"),
    heading: "Understanding the Current Situation",
    content: [
      understandingLine,
      `I don't want to dismiss the reasons things are currently the way they are — I'd simply like ${audience} to consider an adjustment.`,
    ]
      .filter(Boolean)
      .join(" "),
  });

  sections.push({
    id: generateId("sec"),
    heading: "My Proposal",
    content: [applyStyleFlavor(buildAskLine(request, bank), style), buildSupportingFactsSentence(request, bank)]
      .filter(Boolean)
      .join(" "),
  });

  if (request.supportingFacts.length > 0) {
    sections.push({
      id: generateId("sec"),
      heading: "Supporting Reasons",
      content: request.supportingFacts.map((fact) => `• ${cleanSentence(fact)}`).join("\n"),
    });
  }

  const compromiseSentence = buildCompromiseSentence(request, bank);
  sections.push({
    id: generateId("sec"),
    heading: "Compromise Options",
    content:
      compromiseSentence ||
      `If the full proposal isn't workable right away, I'm open to trying a scaled-down or time-limited version first, and revisiting it together after a set period.`,
  });

  sections.push({
    id: generateId("sec"),
    heading: "Closing",
    content: [buildCloser(request, bank), `Thank you for taking the time to consider this.`].join(" "),
  });

  return {
    title: request.title.trim() || `A Proposal Regarding: ${request.situation.slice(0, 60)}`,
    sections,
  };
}

/** Generate the "Interactive Pitch Deck" output as an ordered slide list. */
export function generateSlides(
  request: PitchRequest,
  style: BlendedStyleProfile | null = null,
): SlideContent[] {
  const bank = TONE_BANKS[request.tone];
  const audience = audienceLabel(request);
  const slides: SlideContent[] = [];
  let order = 0;

  const nextOrder = () => {
    order += 1;
    return order;
  };

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "title",
    title: request.title.trim() || "A Proposal Worth Discussing",
    bullets: [`Prepared for a conversation with ${audience}`, `Strategy: ${PITCH_STRATEGIES.find((s) => s.id === request.strategy)?.label ?? ""}`],
    speakerNotes: applyStyleFlavor(buildOpening(request, bank), style),
  });

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "problem",
    title: "The Situation",
    bullets: [cleanSentence(request.situation), buildUnderstandingLine(request, bank)].filter(Boolean),
    speakerNotes: strategyFramingLine(request.strategy, audience),
  });

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "solution",
    title: "Proposed Solution",
    bullets: [cleanSentence(request.desiredOutcome)],
    speakerNotes: applyStyleFlavor(buildAskLine(request, bank), style),
  });

  if (request.supportingFacts.length > 0) {
    slides.push({
      id: generateId("slide"),
      order: nextOrder(),
      type: "data",
      title: request.strategy === "data-presentation" ? "The Evidence" : "Why This Makes Sense",
      bullets: request.supportingFacts.map((fact) => cleanSentence(fact)),
      speakerNotes: "Walk through each data point slowly — let it land before moving to the next slide.",
    });
  }

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "benefits",
    title: `What This Means for ${audience.charAt(0).toUpperCase()}${audience.slice(1)}`,
    bullets: [
      "Fewer recurring conversations about this same topic going forward.",
      "A clear, agreed-upon plan that reduces friction for both sides.",
      request.constraints.trim() ? `Respects the concern: ${cleanSentence(request.constraints)}` : "Shows I've thought this through, not just reacted emotionally.",
    ],
    speakerNotes: "Reframe the ask around their incentives, not just yours.",
  });

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "compromise",
    title: "Compromise Options",
    bullets:
      request.compromiseIdeas.length > 0
        ? request.compromiseIdeas.map((idea) => cleanSentence(idea))
        : ["A trial period to test the arrangement before making it permanent.", "A check-in date to revisit if it isn't working."],
    speakerNotes: buildCompromiseSentence(request, bank) || "Offer these proactively — it shows good faith.",
  });

  slides.push({
    id: generateId("slide"),
    order: nextOrder(),
    type: "closing",
    title: "Next Steps",
    bullets: ["Agree on a decision or trial start date.", "Schedule a follow-up check-in.", "Thank you for hearing me out."],
    speakerNotes: buildCloser(request, bank),
  });

  return slides;
}

const EFFORT_KEYWORDS: Record<CompromiseEffort, string[]> = {
  low: ["trial", "temporary", "small", "quick", "check-in", "test", "one week", "one-week", "short"],
  high: ["permanent", "full", "complete", "major", "long-term", "significant", "budget", "policy"],
  medium: [],
};

function estimateEffort(text: string): CompromiseEffort {
  const lower = text.toLowerCase();
  if (EFFORT_KEYWORDS.low.some((keyword) => lower.includes(keyword))) return "low";
  if (EFFORT_KEYWORDS.high.some((keyword) => lower.includes(keyword))) return "high";
  return "medium";
}

/** Generate the "Compromise Matrix" output — trade-off options for both sides. */
export function generateCompromiseMatrix(request: PitchRequest): CompromiseOption[] {
  const audience = audienceLabel(request);
  const ideas =
    request.compromiseIdeas.length > 0
      ? request.compromiseIdeas
      : [
          `A short trial run of: ${request.desiredOutcome}`,
          `A scaled-back version of the request with a review date`,
          `Keeping things as they are for now, with a revisit in a set number of weeks`,
        ];

  return ideas.map((idea, index) => ({
    id: generateId("compromise"),
    label: cleanSentence(idea),
    theirBenefit:
      index === ideas.length - 1
        ? `${audience.charAt(0).toUpperCase()}${audience.slice(1)} keeps full oversight and can evaluate before committing further.`
        : `Gives ${audience} a low-risk way to see how this works before fully committing.`,
    yourBenefit:
      index === 0
        ? "You get to demonstrate responsibility and build trust quickly."
        : "You get partial progress now instead of an outright no.",
    effortLevel: estimateEffort(idea),
  }));
}

/** Assemble the complete multi-format `GeneratedPitch` for a request. */
export function generatePitch(request: PitchRequest, style: BlendedStyleProfile | null = null): GeneratedPitch {
  const talkingPoints = generateTalkingPoints(request, style);
  const proposal = generateFormalProposal(request, style);
  const slides = generateSlides(request, style);
  const compromiseMatrix = generateCompromiseMatrix(request);

  const proposalText = proposal.sections.map((section) => `${section.heading}\n${section.content}`).join("\n\n");
  const readability = inspectReadability(proposalText);

  return {
    id: generateId("pitch"),
    requestId: request.id,
    requestTitle: request.title,
    strategy: request.strategy,
    tone: request.tone,
    talkingPoints,
    proposal,
    slides,
    compromiseMatrix,
    readability,
    createdAt: Date.now(),
  };
}
