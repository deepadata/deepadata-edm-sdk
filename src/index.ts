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

// =============================================================================
// Core Extraction API
// =============================================================================
export {
  extractFromContent,
  extractFromContentWithClient,
  assembleArtifact,
  createEmptyArtifact,
  // Profile field definitions
  ESSENTIAL_PROFILE_FIELDS,
  EXTENDED_PROFILE_FIELDS,
  FULL_PROFILE_FIELDS,
  getProfileFields,
  getProfileDomains,
  filterByProfile,
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
  validateEDMWithProfile,
  validateProfileConformance,
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

export type {
  LlmExtractionResult,
  LlmEssentialExtracted,
  LlmExtendedExtracted,
} from "./extractors/llm-extractor.js";

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
  // Profile-specific LLM Extraction Schemas
  LlmEssentialFieldsSchema,
  LlmExtendedFieldsSchema,
  ConstellationEssentialSchema,
  GravityExtendedSchema,
  // Nested Schemas
  RetentionPolicySchema,
  SubjectRightsSchema,
  KAnonymitySchema,
  EmbeddingRefSchema,
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
export type {
  CompletenessResult,
  DomainName,
  ProfileConformanceResult,
  ProfileConformanceError,
} from "./validator.js";

// Re-export ActivateResult type
export type { ActivateResult } from "./schema/types.js";

// =============================================================================
// Activate API
// =============================================================================
import type { ActivateResult } from "./schema/types.js";

export async function activate(
  query: string,
  options: {
    apiKey?: string;
    baseUrl?: string;
    subjectVpId?: string;
    topK?: number;
  } = {}
): Promise<ActivateResult> {
  const apiKey = options.apiKey ?? process.env.DEEPADATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPADATA_API_KEY is required for activate(). " +
        "Pass apiKey option or set DEEPADATA_API_KEY env var."
    );
  }
  const baseUrl =
    options.baseUrl ?? process.env.DEEPADATA_API_URL ?? "https://deepadata.com";

  const response = await fetch(`${baseUrl}/api/v1/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      subject_vp_id: options.subjectVpId,
      top_k: options.topK ?? 10,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `activate() failed: ${response.status} ` +
        `${(error as Record<string, unknown>).error ?? ""}`
    );
  }

  const result = (await response.json()) as {
    data: {
      arc_types?: string[];
      primary_domain?: string | null;
      field_filters?: Array<{
        field: string;
        operator: string;
        value: unknown;
        weight: number;
      }>;
      confidence?: number;
      significance_gate?: boolean;
    };
  };
  const data = result.data;

  return {
    arcTypes: data.arc_types ?? [],
    primaryDomain: data.primary_domain ?? null,
    fieldFilters: data.field_filters ?? [],
    confidence: data.confidence ?? 0,
    significanceGate: data.significance_gate ?? false,
  };
}
