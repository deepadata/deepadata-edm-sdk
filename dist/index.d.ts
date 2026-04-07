/**
 * DeepAData EDM SDK v0.6.0
 *
 * SDK for assembling EDM artifacts from user content using LLM-assisted extraction.
 * Follows interpretation constraints (extraction, not inference) for EU AI Act compliance.
 * Enforces exact field-level profile filtering per EDM v0.6.0 spec.
 *
 * @example
 * ```typescript
 * import { extractFromContent, createStatelessArtifact, validateEDM } from 'deepadata-edm-sdk';
 *
 * // Extract with LLM - profile filtering is automatic
 * const artifact = await extractFromContent({
 *   content: { text: "User's narrative..." },
 *   metadata: { consentBasis: "consent" },
 *   profile: "essential"  // Returns only essential profile fields
 * });
 *
 * // For session use: create stateless version
 * const stateless = createStatelessArtifact(artifact);
 *
 * // Validate profile conformance
 * const validation = validateProfileConformance(artifact);
 * ```
 */
export { extractFromContent, extractFromContentWithClient, assembleArtifact, createEmptyArtifact, ESSENTIAL_PROFILE_FIELDS, EXTENDED_PROFILE_FIELDS, FULL_PROFILE_FIELDS, getProfileFields, getProfileDomains, filterByProfile, } from "./assembler.js";
export { createStatelessArtifact, isStateless, validateStateless, } from "./stateless.js";
export { validateEDM, validateEDMStrict, validateEDMWithProfile, validateProfileConformance, validateDomain, validateCompleteness, } from "./validator.js";
export { extractWithLlm, createAnthropicClient, EXTRACTION_SYSTEM_PROMPT, calculateConfidence, } from "./extractors/llm-extractor.js";
export type { LlmExtractionResult, LlmEssentialExtracted, LlmExtendedExtracted, } from "./extractors/llm-extractor.js";
export { extractWithOpenAI, createOpenAIClient } from "./extractors/openai-extractor.js";
export { extractWithKimi, createKimiClient, getKimiModelId } from "./extractors/kimi-extractor.js";
export { analyzeImage, mergeImageContext } from "./extractors/image-analyzer.js";
export { createMeta, createGovernance, createTelemetry, createSystem, createCrosswalks, detectSourceType, } from "./extractors/domain-extractors.js";
export { MetaSchema, CoreSchema, ConstellationSchema, MilkyWaySchema, GravitySchema, ImpulseSchema, GovernanceSchema, TelemetrySchema, SystemSchema, CrosswalksSchema, EdmArtifactSchema, LlmExtractedFieldsSchema, LlmEssentialFieldsSchema, LlmExtendedFieldsSchema, ConstellationEssentialSchema, GravityExtendedSchema, RetentionPolicySchema, SubjectRightsSchema, KAnonymitySchema, EmbeddingRefSchema, IndicesSchema, } from "./schema/edm-schema.js";
export type { Meta, Core, Constellation, MilkyWay, Gravity, Impulse, Governance, Telemetry, System, Crosswalks, RetentionPolicy, SubjectRights, KAnonymity, EmbeddingRef, Indices, EdmArtifact, LlmExtractedFields, ExtractionInput, ExtractionMetadata, ExtractionOptions, ValidationResult, ValidationError, } from "./schema/types.js";
export { EMOTION_PRIMARY, NARRATIVE_ARC, RELATIONAL_DYNAMICS, TEMPORAL_CONTEXT, MEMORY_TYPE, NARRATIVE_ARCHETYPE, DRIVE_STATE, MOTIVATIONAL_ORIENTATION, } from "./schema/types.js";
export type { StatelessValidation } from "./stateless.js";
export type { CompletenessResult, DomainName, ProfileConformanceResult, ProfileConformanceError, } from "./validator.js";
export type { ActivateResult, FeedbackOptions } from "./schema/types.js";
import type { ActivateResult, FeedbackOptions } from "./schema/types.js";
export declare function activate(query: string, options?: {
    apiKey?: string;
    baseUrl?: string;
    subjectVpId?: string;
    topK?: number;
}): Promise<ActivateResult>;
export declare function feedback(options: FeedbackOptions): Promise<void>;
//# sourceMappingURL=index.d.ts.map