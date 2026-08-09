/**
 * EDM Artifact Assembler
 * Combines LLM-extracted fields with metadata to create complete artifacts
 * Enforces exact field-level profile filtering per EDM spec
 * EDM schema version is declared in src/version.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EdmArtifact, ExtractionOptions, ExtractionInput, LlmExtractedFields, EdmProfile, PartnerProfileId } from "./schema/types.js";
import { type ConversationMessage, type ChunkConversationOptions } from "./conversation.js";
/**
 * PROFILE MANIFESTS — GUARDED RESTATEMENT of the spec composites.
 *
 * Field membership per profile is defined by the edm-spec composite
 * schemas (edm.v0.8.{essential,extended,full}.schema.json in the installed
 * `edm-spec` package). These literal manifests restate the composites'
 * property sets so the arrays keep literal-union TypeScript types and a
 * stable filter order; tests/spec-drift-guard.test.ts asserts exact set
 * equality with the composites in both directions and fails `npm test`
 * loudly on any drift (tidy-the-house commitment, ADR-0030).
 */
/**
 * Essential Profile: 5 domains
 * Target: memory platforms, agent frameworks, AI assistants
 * Field membership = the spec essential composite (drift-guarded).
 */
export declare const ESSENTIAL_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "updated_at", "locale", "owner_user_id", "parent_id", "visibility", "pii_tier", "consent_basis"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "narrative_arc"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights", "exportability", "k_anonymity", "policy_labels", "masking_rules"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model", "extraction_provider", "extraction_notes"];
};
/**
 * Extended Profile: 7 domains
 * Target: journaling apps, companion AI, workplace wellness
 * Impulse domain is NOT included in Extended profile
 * Field membership = the spec extended composite (drift-guarded).
 */
export declare const EXTENDED_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "updated_at", "locale", "owner_user_id", "parent_id", "visibility", "pii_tier", "source_type", "source_context", "consent_basis", "consent_scope", "tags"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state", "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context", "memory_type", "media_format", "narrative_archetype", "symbolic_anchor", "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight", "transformational_pivot", "somatic_signature", "arc_type"];
    readonly milky_way: readonly ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"];
    readonly gravity: readonly ["emotional_weight", "valence", "tether_type", "recurrence_pattern", "strength_score"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights", "exportability", "k_anonymity", "policy_labels", "masking_rules"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model", "extraction_provider", "extraction_notes"];
};
/**
 * Full Profile: all 10 domains, all fields
 * Target: therapy platforms, clinical tools, regulated systems
 * Field membership = the spec full composite (drift-guarded).
 */
export declare const FULL_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "source_timestamp", "updated_at", "locale", "owner_user_id", "parent_id", "visibility", "pii_tier", "source_type", "source_context", "consent_basis", "consent_scope", "consent_revoked_at", "tags"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state", "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context", "memory_type", "media_format", "narrative_archetype", "symbolic_anchor", "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight", "transformational_pivot", "somatic_signature", "arc_type"];
    readonly milky_way: readonly ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"];
    readonly gravity: readonly ["emotional_weight", "emotional_density", "valence", "viscosity", "gravity_type", "tether_type", "recall_triggers", "retrieval_keys", "nearby_themes", "recurrence_pattern", "strength_score", "temporal_decay", "resilience_markers", "adaptation_trajectory"];
    readonly impulse: readonly ["primary_energy", "drive_state", "motivational_orientation", "temporal_focus", "directionality", "social_visibility", "urgency", "risk_posture", "agency_level", "regulation_state", "attachment_style", "coping_style"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights", "exportability", "k_anonymity", "policy_labels", "masking_rules"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model", "extraction_provider", "extraction_notes"];
    readonly system: readonly ["embeddings", "indices"];
    readonly crosswalks: readonly ["plutchik_primary", "geneva_emotion_wheel", "DSM5_specifiers", "ISO_27557_labels"];
};
/**
 * Get profile field definitions
 */
export declare function getProfileFields(profile: EdmProfile): Record<string, readonly string[]>;
/**
 * Get domains included in a profile
 */
export declare function getProfileDomains(profile: EdmProfile): string[];
/**
 * Check if profile is one of the canonical profiles (essential/extended/full)
 */
export declare function isCanonicalProfile(profile: string): profile is "essential" | "extended" | "full";
/**
 * Check if profile is a partner profile (prefixed with "partner:")
 */
export declare function isPartnerProfile(profile: string): profile is PartnerProfileId;
/**
 * Extract the profile ID from a partner profile string
 * Returns null if not a partner profile
 */
export declare function getPartnerProfileId(profile: string): string | null;
/**
 * Filter artifact to include only fields defined for the declared profile
 * Per EDM Profile Invariants: out-of-profile fields MUST be omitted entirely
 */
export declare function filterByProfile(artifact: Record<string, unknown>, profile: EdmProfile): Record<string, unknown>;
/**
 * Profile-specific extracted fields (union type)
 */
type ProfileExtractedFields = Record<string, unknown>;
/**
 * Thrown when extraction is requested for input with no extractable
 * content. Raised BEFORE any provider client is created — empty and
 * whitespace-only inputs previously burned a provider round-trip to
 * receive a 400 (finding F2, 0.8.14 overnight validation).
 */
export declare class EmptyInputError extends Error {
    /** Stable programmatic discriminator for callers that map errors. */
    readonly code = "EMPTY_INPUT";
    constructor();
}
/**
 * Reject inputs with nothing to extract. Image-only input is allowed
 * (the extractors support image analysis without accompanying text).
 */
export declare function assertExtractableInput(content: ExtractionInput): void;
/**
 * Extract a complete EDM artifact from content
 *
 * An unset profile defaults to "full" — intentional (founder decision,
 * 2026-08-04): an initial user gets the entire view. Not a defect.
 *
 * @param options - Extraction options including profile
 * @returns Profile-conformant EDM artifact
 */
export declare function extractFromContent(options: ExtractionOptions): Promise<Record<string, unknown>>;
export interface ConversationExtractionOptions extends Omit<ExtractionOptions, "content"> {
    /** Parsed conversation messages (caller's export parser supplies these) */
    messages: ConversationMessage[];
    /** Chunking controls; defaults to 48K chars per chunk, turn-aligned */
    chunking?: ChunkConversationOptions;
}
export interface ConversationChunkArtifact {
    artifact: Record<string, unknown>;
    /** Which slice of the conversation this artifact covers */
    chunk: {
        index: number;
        turnRange: [number, number];
    };
}
/**
 * Extract EDM artifacts from a full conversation with per_session chunking.
 *
 * Replaces caller-side head+tail truncation: the conversation is split into
 * full-coverage, turn-aligned chunks (chunkConversation), each chunk is
 * extracted as a conversation input (framed, subject-anchored, stance-guarded),
 * and chunks after the first are threaded to the first chunk's artifact via
 * metadata.parentId. meta.parent_id is defined in ALL profile schemas
 * (essential, extended, full) per the published v0.8-line schema set, so the
 * linkage appears in the artifact body for every profile — populated for
 * chunks past the first, explicit null otherwise (whitepaper §5.2 No
 * Omission). Short conversations produce exactly one artifact.
 */
export declare function extractFromConversation(options: ConversationExtractionOptions): Promise<ConversationChunkArtifact[]>;
/**
 * Extract from content with a provided Anthropic client
 */
export declare function extractFromContentWithClient(client: Anthropic, options: ExtractionOptions): Promise<Record<string, unknown>>;
interface AssemblyContext {
    confidence: number;
    model: string;
    profile: EdmProfile;
    provider?: 'anthropic' | 'openai' | 'kimi';
    notes: string | null;
    hasText: boolean;
    hasImage: boolean;
}
/**
 * Assemble a profile-specific EDM artifact from extracted fields and metadata
 * Returns only the domains defined for the declared profile
 */
export declare function assembleProfileArtifact(extracted: ProfileExtractedFields, metadata: ExtractionOptions["metadata"], context: AssemblyContext): Record<string, unknown>;
/**
 * Assemble a complete EDM artifact from extracted fields and metadata
 * Note: Returns full artifact structure; use filterByProfile to strip out-of-profile fields
 * @deprecated Use assembleProfileArtifact for profile-aware assembly
 */
export declare function assembleArtifact(extracted: LlmExtractedFields, metadata: ExtractionOptions["metadata"], context: AssemblyContext): EdmArtifact;
/**
 * Create an empty EDM artifact structure (for manual population)
 */
export declare function createEmptyArtifact(): EdmArtifact;
export {};
//# sourceMappingURL=assembler.d.ts.map