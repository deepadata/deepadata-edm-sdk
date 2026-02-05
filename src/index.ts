/**
 * DeepAData EDM SDK v0.4.0
 *
 * SDK for assembling EDM artifacts from user content using LLM-assisted extraction.
 * Follows interpretation constraints (extraction, not inference) for EU AI Act compliance.
 *
 * @example
 * ```typescript
 * import { extractFromContent, createStatelessArtifact, validateEDM } from 'deepadata-edm-sdk';
 *
 * // Extract with LLM
 * const artifact = await extractFromContent({
 *   content: { text: "User's narrative..." },
 *   metadata: { consentBasis: "consent" }
 * });
 *
 * // For session use: create stateless version
 * const stateless = createStatelessArtifact(artifact);
 *
 * // Validate
 * const validation = validateEDM(artifact);
 * ```
 */

// =============================================================================
// Core Extraction API
// =============================================================================
export {
  extractFromContent,
  extractFromContentWithClient,
  assembleArtifact,
  createEmptyArtifact,
} from "./assembler.js";

// =============================================================================
// Stateless Mode
// =============================================================================
export {
  createStatelessArtifact,
  isStateless,
  validateStateless,
} from "./stateless.js";

// =============================================================================
// Validation
// =============================================================================
export {
  validateEDM,
  validateEDMStrict,
  validateDomain,
  validateCompleteness,
} from "./validator.js";

// =============================================================================
// LLM Integration
// =============================================================================
export {
  extractWithLlm,
  createAnthropicClient,
  EXTRACTION_SYSTEM_PROMPT,
  calculateConfidence,
} from "./extractors/llm-extractor.js";

export type { LlmExtractionResult } from "./extractors/llm-extractor.js";

export { extractWithOpenAI, createOpenAIClient } from "./extractors/openai-extractor.js";

export { extractWithKimi, createKimiClient, getKimiModelId } from "./extractors/kimi-extractor.js";

export { analyzeImage, mergeImageContext } from "./extractors/image-analyzer.js";

// =============================================================================
// Domain Helpers
// =============================================================================
export {
  createMeta,
  createGovernance,
  createTelemetry,
  createSystem,
  createCrosswalks,
  detectSourceType,
} from "./extractors/domain-extractors.js";

// =============================================================================
// Schema & Types
// =============================================================================
export {
  // Domain Schemas
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
  // Composite Schemas
  EdmArtifactSchema,
  LlmExtractedFieldsSchema,
  // Nested Schemas
  RetentionPolicySchema,
  SubjectRightsSchema,
  KAnonymitySchema,
  EmbeddingRefSchema,
  SectorWeightsSchema,
  IndicesSchema,
} from "./schema/edm-schema.js";

export type {
  // Domain Types
  Meta,
  Core,
  Constellation,
  MilkyWay,
  Gravity,
  Impulse,
  Governance,
  Telemetry,
  System,
  Crosswalks,
  // Nested Types
  RetentionPolicy,
  SubjectRights,
  KAnonymity,
  EmbeddingRef,
  SectorWeights,
  Indices,
  // Composite Types
  EdmArtifact,
  LlmExtractedFields,
  // Input Types
  ExtractionInput,
  ExtractionMetadata,
  ExtractionOptions,
  // Validation Types
  ValidationResult,
  ValidationError,
} from "./schema/types.js";

// Enum constants
export {
  EMOTION_PRIMARY,
  NARRATIVE_ARC,
  RELATIONAL_DYNAMICS,
  TEMPORAL_CONTEXT,
  MEMORY_TYPE,
  NARRATIVE_ARCHETYPE,
  DRIVE_STATE,
  MOTIVATIONAL_ORIENTATION,
} from "./schema/types.js";

// Validation types from stateless
export type { StatelessValidation } from "./stateless.js";

// Validation types from validator
export type { CompletenessResult, DomainName } from "./validator.js";
