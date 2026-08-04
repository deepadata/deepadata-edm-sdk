/**
 * EDM TypeScript Types
 * Inferred from Zod schemas
 * EDM schema version is declared in src/version.ts
 */
import { z } from "zod";
import {
  MetaSchema,
  CoreSchema,
  ConstellationSchema,
  MilkyWaySchema,
  GravitySchema,
  ImpulseSchema,
  GovernanceSchema,
  TelemetrySchema,
  SystemSchema,
  CrosswalksSchema,
  EdmArtifactSchema,
  LlmExtractedFieldsSchema,
  RetentionPolicySchema,
  SubjectRightsSchema,
  KAnonymitySchema,
  EmbeddingRefSchema,
  IndicesSchema,
} from "./edm-schema.js";

// =============================================================================
// Domain Types
// =============================================================================
export type Meta = z.infer<typeof MetaSchema>;
export type Core = z.infer<typeof CoreSchema>;
export type Constellation = z.infer<typeof ConstellationSchema>;
export type MilkyWay = z.infer<typeof MilkyWaySchema>;
export type Gravity = z.infer<typeof GravitySchema>;
export type Impulse = z.infer<typeof ImpulseSchema>;
export type Governance = z.infer<typeof GovernanceSchema>;
export type Telemetry = z.infer<typeof TelemetrySchema>;
export type System = z.infer<typeof SystemSchema>;
export type Crosswalks = z.infer<typeof CrosswalksSchema>;

// =============================================================================
// Nested Types
// =============================================================================
export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;
export type SubjectRights = z.infer<typeof SubjectRightsSchema>;
export type KAnonymity = z.infer<typeof KAnonymitySchema>;
export type EmbeddingRef = z.infer<typeof EmbeddingRefSchema>;
export type Indices = z.infer<typeof IndicesSchema>;

// =============================================================================
// Composite Types
// =============================================================================
export type EdmArtifact = z.infer<typeof EdmArtifactSchema>;
export type LlmExtractedFields = z.infer<typeof LlmExtractedFieldsSchema>;

// =============================================================================
// Input Types
// =============================================================================
export interface ExtractionInput {
  /** Primary text content */
  text: string;
  /** Optional base64-encoded image */
  image?: string;
  /** Optional image media type */
  imageMediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  /**
   * How to treat the text (default "memory"):
   * - "memory": first-person memory/passage, sent to the model as-is
   * - "conversation": a flattened chat transcript (USER:/ASSISTANT: turns).
   *   Extractors wrap it in source-material framing so the model classifies
   *   the conversation instead of replying to it, and treats the USER
   *   speaker as the subject.
   */
  inputType?: "memory" | "conversation";
}

/**
 * Experiential stance — whose experience the emotionally salient material
 * is, relative to the subject. Proposed for EDM v0.9; until then it travels
 * in extraction results and telemetry notes, never in the artifact body.
 */
export const EXPERIENTIAL_STANCE = [
  "lived",
  "witnessed",
  "quoted_third_party",
  "assistant_generated",
  "hypothetical",
] as const;

export type ExperientialStance = (typeof EXPERIENTIAL_STANCE)[number];

export interface ExtractionMetadata {
  /** Owner identifier (VitaPass recommended) */
  subjectId?: string;
  /** Regulatory jurisdiction */
  jurisdiction?: Governance["jurisdiction"];
  /** Legal basis for processing */
  consentBasis: Meta["consent_basis"];
  /** Locale code (e.g., "en-us") */
  locale?: string;
  /** Parent artifact ID for threading */
  parentId?: string;
  /** User-defined tags */
  tags?: string[];
  /** Visibility setting */
  visibility?: Meta["visibility"];
  /** PII classification */
  piiTier?: Meta["pii_tier"];
  /** Retention policy basis (default "user_defined") */
  retentionPolicyBasis?: RetentionPolicy["basis"];
}

/**
 * Partner profile ID with required "partner:" prefix per ADR-0017
 * e.g. "partner:com.deepadata.journaling.v1"
 */
export type PartnerProfileId = `partner:${string}`;

/**
 * EDM Implementation Profile
 * - essential: minimal extraction for memory platforms
 * - extended: adds full Constellation and key Gravity fields
 * - full: the complete field set, complete extraction
 * - partner:<profile_id>: partner-defined profile per ADR-0017
 * Field membership per profile is defined by the edm-spec composite
 * schemas (installed `edm-spec` package) — see assembler.ts manifests.
 */
export type EdmProfile = 'essential' | 'extended' | 'full' | PartnerProfileId;

export interface ExtractionOptions {
  /** Content to extract from */
  content: ExtractionInput;
  /** Metadata and governance options */
  metadata: ExtractionMetadata;
  /**
   * EDM profile to extract (default: 'full')
   * - essential: minimal, for memory platforms and agent frameworks
   * - extended: mid-tier, for journaling and companion AI
   * - full: the complete field set, for therapy and regulated systems
   *
   * The 'full' default when unset is INTENTIONAL (founder decision,
   * 2026-08-04): an initial user gets the entire view of what the EDM
   * captures. Not a defect — do not change to a lighter default.
   */
  profile?: EdmProfile;
  /** LLM provider to use for extraction (default: 'anthropic') */
  provider?: 'anthropic' | 'openai' | 'kimi';
  /** Model to use for extraction (provider-specific, uses default if omitted) */
  model?: string;
  /** Temperature for OpenAI extractions (0-2, lower = more deterministic) */
  temperature?: number;
  /**
   * Output token budget for the extraction call. Defaults to 2048 for
   * non-thinking models (real completions run 600–1,200 tokens), or
   * 16384 when the model is a thinking model (reasoning tokens count
   * against max_tokens, and smaller budgets silently truncated extraction
   * on exactly the most emotionally dense inputs).
   */
  maxTokens?: number;
  /**
   * Model for the stance-classifier verification pass. Has its own knob:
   * per-request here → STANCE_MODEL env → the fast non-thinking default in
   * model-config. Deliberately does NOT inherit the extraction model (or
   * EXTRACTION_MODEL) — the classifier answers with one word and a
   * thinking-class model would double latency for nothing.
   */
  stanceModel?: string;
  /**
   * Stance classifier verification pass (see stance-guard):
   * - "auto" (default): run a cheap classifier call when the input is a
   *   conversation and the extraction claims lived/witnessed material at
   *   emotional_weight >= 0.6 — the regime where misattribution bites
   * - true: always run; false: never run (prompt + deterministic guard
   *   still apply)
   */
  verifyStance?: boolean | "auto";
}

// =============================================================================
// Validation Types
// =============================================================================
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  /**
   * Non-fatal conditions the caller should surface — e.g. a partner
   * profile whose completeness validation was SKIPPED pending registry
   * lookup (ADR-0012). Added for D4 (partner-profiles 2026-08-02):
   * /v1/validate previously returned a bare `valid: true` and the caller
   * could not see that conformance was skipped. Present only when
   * non-empty.
   */
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

// =============================================================================
// Enum Constants (for convenience)
//
// GUARDED RESTATEMENT: these literal arrays restate the edm-spec fragment
// vocabularies (`enum` for hard enums, `x-edm-canonical` for two-tier
// free-text fields) so they keep literal-union TypeScript types — deriving
// them at runtime would collapse the types to string[]. They are asserted
// equal to the installed spec's vocabularies, both directions, by
// tests/spec-drift-guard.test.ts; any drift fails `npm test` loudly.
// =============================================================================
export const EMOTION_PRIMARY = [
  "joy",
  "sadness",
  "fear",
  "anger",
  "wonder",
  "peace",
  "tenderness",
  "reverence",
  "pride",
  "anxiety",
  "gratitude",
  "longing",
  "hope",
  "shame",
  "disappointment",
  "relief",
  "frustration",
] as const;

export const NARRATIVE_ARC = [
  "overcoming",
  "transformation",
  "connection",
  "reflection",
  "closure",
  "loss",
  "confrontation",
] as const;

export const RELATIONAL_DYNAMICS = [
  "parent_child",
  "grandparent_grandchild",
  "romantic_partnership",
  "couple",
  "sibling_bond",
  "family",
  "friendship",
  "friend",
  "companionship",
  "colleague",
  "mentorship",
  "reunion",
  "community_ritual",
  "grief",
  "self_reflection",
  "professional",
  "therapeutic",
  "service",
  "adversarial",
] as const;

export const TEMPORAL_CONTEXT = [
  "childhood",
  "early_adulthood",
  "midlife",
  "late_life",
  "recent",
  "future",
  "timeless",
] as const;

export const MEMORY_TYPE = [
  "legacy_artifact",
  "fleeting_moment",
  "milestone",
  "reflection",
  "formative_experience",
] as const;

export const NARRATIVE_ARCHETYPE = [
  "hero",
  "caregiver",
  "seeker",
  "sage",
  "lover",
  "outlaw",
  "innocent",
  "magician",
  "creator",
  "everyman",
  "jester",
  "ruler",
] as const;

export const DRIVE_STATE = [
  "explore",
  "approach",
  "avoid",
  "repair",
  "persevere",
  "share",
  "confront",
  "protect",
  "process",
] as const;

export const MOTIVATIONAL_ORIENTATION = [
  "belonging",
  "safety",
  "mastery",
  "meaning",
  "autonomy",
  "authenticity",
] as const;

// =============================================================================
// Activate API Types
// =============================================================================
export interface ActivateResult {
  activationId: string | null;
  arcTypes: string[];
  primaryDomain: string | null;
  fieldFilters: Array<{
    field: string;
    operator: string;
    value: unknown;
    weight: number;
  }>;
  confidence: number;
  significanceGate: boolean;
}

export interface FeedbackOptions {
  activationId: string;
  hit: boolean;
  subjectVpId?: string;
  apiKey?: string;
  baseUrl?: string;
}

// =============================================================================
// Activate Reason API Types (ADR-0018)
// =============================================================================
export interface ActivateReasonSource {
  date: string;
  narrative: string;
  arc_type: string | null;
  emotional_weight: number;
  identity_thread: string | null;
  tether_type: string | null;
}

export interface ActivateReasonResult {
  /** Reasoning event ID for partner correlation; null when significance gate is closed */
  arcReasoningEventId: string | null;
  /** Reasoned answer grounded in retrieved candidates; null when significance gate is closed */
  answer: string | null;
  /** Top sources that informed the answer (length capped by topK, max 20) */
  sources: ActivateReasonSource[];
  /** EDM fields the reasoning model attended to */
  reasoningFieldsUsed: string[];
  /** Arc types matched by query classification */
  arcTypes: string[];
  /** Classification confidence (0-1) */
  confidence: number;
  /** True when the query carries enough significance for reasoning to fire */
  significanceGate: boolean;
  /** Number of candidate artifacts considered before sources were selected */
  candidateCount: number;
  /** Reasoning model used (e.g. "kimi-k2"); null when significance gate is closed and no reasoning fired */
  reasoningModel: string | null;
  /** ISO timestamp of when reasoning completed */
  activatedAt: string | null;
}

export interface ActivateReasonOptions {
  /** TurboPuffer namespace to query against */
  namespace: string;
  /** Optional VitaPass subject ID for scoping the activation event */
  subjectVpId?: string;
  /** Number of sources to return in the response (default 5, max 20) */
  topK?: number;
  /** API key for the deepadata-com platform; falls back to DEEPADATA_API_KEY env */
  apiKey?: string;
  /** Override platform base URL; defaults to https://deepadata.com */
  baseUrl?: string;
}
