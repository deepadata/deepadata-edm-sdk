/**
 * EDM TypeScript Types
 * Inferred from Zod schemas
 * EDM schema version is declared in src/version.ts
 */
import { z } from "zod";
import { MetaSchema, CoreSchema, ConstellationSchema, MilkyWaySchema, GravitySchema, ImpulseSchema, GovernanceSchema, TelemetrySchema, SystemSchema, CrosswalksSchema, EdmArtifactSchema, LlmExtractedFieldsSchema, RetentionPolicySchema, SubjectRightsSchema, KAnonymitySchema, EmbeddingRefSchema, IndicesSchema } from "./edm-schema.js";
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
export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;
export type SubjectRights = z.infer<typeof SubjectRightsSchema>;
export type KAnonymity = z.infer<typeof KAnonymitySchema>;
export type EmbeddingRef = z.infer<typeof EmbeddingRefSchema>;
export type Indices = z.infer<typeof IndicesSchema>;
export type EdmArtifact = z.infer<typeof EdmArtifactSchema>;
export type LlmExtractedFields = z.infer<typeof LlmExtractedFieldsSchema>;
export interface ExtractionInput {
    /** Primary text content */
    text: string;
    /** Optional base64-encoded image */
    image?: string;
    /** Optional image media type */
    imageMediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}
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
 * - essential: ~20 required fields, minimal extraction for memory platforms
 * - extended: ~45 fields, adds full Constellation and key Gravity fields
 * - full: all 96 fields, complete extraction
 * - partner:<profile_id>: partner-defined profile per ADR-0017
 */
export type EdmProfile = 'essential' | 'extended' | 'full' | PartnerProfileId;
export interface ExtractionOptions {
    /** Content to extract from */
    content: ExtractionInput;
    /** Metadata and governance options */
    metadata: ExtractionMetadata;
    /**
     * EDM profile to extract (default: 'full')
     * - essential: ~20 fields, for memory platforms and agent frameworks
     * - extended: ~45 fields, for journaling and companion AI
     * - full: all 96 fields, for therapy and regulated systems
     */
    profile?: EdmProfile;
    /** LLM provider to use for extraction (default: 'anthropic') */
    provider?: 'anthropic' | 'openai' | 'kimi';
    /** Model to use for extraction (provider-specific, uses default if omitted) */
    model?: string;
    /** Temperature for OpenAI extractions (0-2, lower = more deterministic) */
    temperature?: number;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export interface ValidationError {
    path: string;
    message: string;
    code: string;
}
export declare const EMOTION_PRIMARY: readonly ["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence"];
export declare const NARRATIVE_ARC: readonly ["overcoming", "transformation", "connection", "reflection", "closure"];
export declare const RELATIONAL_DYNAMICS: readonly ["parent_child", "romantic_partnership", "sibling_bond", "friendship", "companionship", "mentorship", "reunion", "community_ritual", "grief", "self_reflection"];
export declare const TEMPORAL_CONTEXT: readonly ["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"];
export declare const MEMORY_TYPE: readonly ["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"];
export declare const NARRATIVE_ARCHETYPE: readonly ["hero", "caregiver", "seeker", "sage", "lover", "outlaw", "innocent", "magician", "creator", "everyman", "jester", "ruler", "mentor"];
export declare const DRIVE_STATE: readonly ["explore", "approach", "avoid", "repair", "persevere", "share"];
export declare const MOTIVATIONAL_ORIENTATION: readonly ["belonging", "safety", "mastery", "meaning", "autonomy"];
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
//# sourceMappingURL=types.d.ts.map