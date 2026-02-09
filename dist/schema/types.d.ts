/**
 * EDM v0.4.0 TypeScript Types
 * Inferred from Zod schemas
 */
import { z } from "zod";
import { MetaSchema, CoreSchema, ConstellationSchema, MilkyWaySchema, GravitySchema, ImpulseSchema, GovernanceSchema, TelemetrySchema, SystemSchema, CrosswalksSchema, EdmArtifactSchema, LlmExtractedFieldsSchema, RetentionPolicySchema, SubjectRightsSchema, KAnonymitySchema, EmbeddingRefSchema, SectorWeightsSchema, IndicesSchema } from "./edm-schema.js";
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
export type SectorWeights = z.infer<typeof SectorWeightsSchema>;
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
}
export interface ExtractionOptions {
    /** Content to extract from */
    content: ExtractionInput;
    /** Metadata and governance options */
    metadata: ExtractionMetadata;
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
//# sourceMappingURL=types.d.ts.map