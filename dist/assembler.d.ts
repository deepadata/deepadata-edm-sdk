/**
 * EDM Artifact Assembler v0.6.0
 * Combines LLM-extracted fields with metadata to create complete artifacts
 * Enforces exact field-level profile filtering per EDM v0.6.0 spec
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EdmArtifact, ExtractionOptions, LlmExtractedFields, EdmProfile } from "./schema/types.js";
/**
 * Essential Profile: 5 domains, ~25 fields
 * Target: memory platforms, agent frameworks, AI assistants
 */
export declare const ESSENTIAL_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "owner_user_id", "consent_basis", "visibility", "pii_tier"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "narrative_arc"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model"];
};
/**
 * Extended Profile: 8 domains, ~50 fields
 * Target: journaling apps, companion AI, workplace wellness
 */
/**
 * Extended Profile: 7 domains, 50 fields
 * Target: journaling apps, companion AI, workplace wellness
 * Impulse domain is NOT included in Extended profile
 */
export declare const EXTENDED_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "owner_user_id", "consent_basis", "visibility", "pii_tier"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state", "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context", "memory_type", "media_format", "narrative_archetype", "symbolic_anchor", "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight", "transformational_pivot", "somatic_signature"];
    readonly milky_way: readonly ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"];
    readonly gravity: readonly ["emotional_weight", "valence", "tether_type", "recurrence_pattern", "strength_score"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model"];
};
/**
 * Full Profile: all 10 domains, all fields
 * Target: therapy platforms, clinical tools, regulated systems
 */
export declare const FULL_PROFILE_FIELDS: {
    readonly meta: readonly ["id", "version", "profile", "created_at", "updated_at", "locale", "owner_user_id", "parent_id", "visibility", "pii_tier", "source_type", "source_context", "consent_basis", "consent_scope", "consent_revoked_at", "tags"];
    readonly core: readonly ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"];
    readonly constellation: readonly ["emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state", "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context", "memory_type", "media_format", "narrative_archetype", "symbolic_anchor", "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight", "transformational_pivot", "somatic_signature"];
    readonly milky_way: readonly ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"];
    readonly gravity: readonly ["emotional_weight", "emotional_density", "valence", "viscosity", "gravity_type", "tether_type", "recall_triggers", "retrieval_keys", "nearby_themes", "legacy_embed", "recurrence_pattern", "strength_score", "temporal_decay", "resilience_markers", "adaptation_trajectory"];
    readonly impulse: readonly ["primary_energy", "drive_state", "motivational_orientation", "temporal_focus", "directionality", "social_visibility", "urgency", "risk_posture", "agency_level", "regulation_state", "attachment_style", "coping_style"];
    readonly governance: readonly ["jurisdiction", "retention_policy", "subject_rights", "exportability", "k_anonymity", "policy_labels", "masking_rules"];
    readonly telemetry: readonly ["entry_confidence", "extraction_model", "extraction_provider", "extraction_notes", "alignment_delta"];
    readonly system: readonly ["embeddings", "indices"];
    readonly crosswalks: readonly ["plutchik_primary", "geneva_emotion_wheel", "DSM5_specifiers", "HMD_v2_memory_type", "ISO_27557_labels"];
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
 * Filter artifact to include only fields defined for the declared profile
 * Per EDM v0.6.0 Profile Invariants: out-of-profile fields MUST be omitted entirely
 */
export declare function filterByProfile(artifact: Record<string, unknown>, profile: EdmProfile): Record<string, unknown>;
/**
 * Profile-specific extracted fields (union type)
 */
type ProfileExtractedFields = Record<string, unknown>;
/**
 * Extract a complete EDM artifact from content
 *
 * @param options - Extraction options including profile
 * @returns Profile-conformant EDM artifact
 */
export declare function extractFromContent(options: ExtractionOptions): Promise<Record<string, unknown>>;
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