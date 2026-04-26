/**
 * DeepAData EDM SDK
 *
 * SDK for assembling EDM artifacts from user content using LLM-assisted extraction.
 * Follows interpretation constraints (extraction, not inference) for EU AI Act compliance.
 * Enforces exact field-level profile filtering per EDM spec.
 * EDM schema version is declared in src/version.ts
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
  // Profile Types
  EdmProfile,
  PartnerProfileId,
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

// Re-export ActivateResult and FeedbackOptions types
export type {
  ActivateResult,
  FeedbackOptions,
  ActivateReasonResult,
  ActivateReasonOptions,
  ActivateReasonSource,
} from "./schema/types.js";

// =============================================================================
// Activate API
// =============================================================================
import type {
  ActivateResult,
  FeedbackOptions,
  ActivateReasonResult,
  ActivateReasonOptions,
  ActivateReasonSource,
} from "./schema/types.js";

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
      activation_id?: string | null;
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
    activationId: data.activation_id ?? null,
    arcTypes: data.arc_types ?? [],
    primaryDomain: data.primary_domain ?? null,
    fieldFilters: data.field_filters ?? [],
    confidence: data.confidence ?? 0,
    significanceGate: data.significance_gate ?? false,
  };
}

// =============================================================================
// Feedback API
// =============================================================================
export async function feedback(options: FeedbackOptions): Promise<void> {
  const apiKey = options.apiKey ?? process.env.DEEPADATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPADATA_API_KEY is required for feedback(). " +
        "Pass apiKey option or set DEEPADATA_API_KEY env var."
    );
  }
  const baseUrl =
    options.baseUrl ?? process.env.DEEPADATA_API_URL ?? "https://deepadata.com";

  const response = await fetch(`${baseUrl}/api/v1/feedback`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activation_id: options.activationId,
      hit: options.hit,
      subject_vp_id: options.subjectVpId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `feedback() failed: ${response.status} ` +
        `${(error as Record<string, unknown>).error ?? ""}`
    );
  }
}

// =============================================================================
// Activate Reason API (ADR-0018)
// =============================================================================
export async function activateReason(
  query: string,
  options: ActivateReasonOptions
): Promise<ActivateReasonResult> {
  const apiKey = options.apiKey ?? process.env.DEEPADATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPADATA_API_KEY is required for activateReason(). " +
        "Pass apiKey option or set DEEPADATA_API_KEY env var."
    );
  }
  if (!options.namespace) {
    throw new Error("namespace is required for activateReason().");
  }
  const baseUrl =
    options.baseUrl ?? process.env.DEEPADATA_API_URL ?? "https://deepadata.com";

  const response = await fetch(`${baseUrl}/api/v1/activate_reason`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      namespace: options.namespace,
      subject_vp_id: options.subjectVpId,
      top_k: options.topK ?? 5,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `activateReason() failed: ${response.status} ` +
        `${(error as Record<string, unknown>).error ?? ""}`
    );
  }

  const result = (await response.json()) as {
    data: {
      arc_reasoning_event_id?: string | null;
      answer?: string | null;
      sources?: ActivateReasonSource[];
      reasoning_fields_used?: string[];
      arc_types?: string[];
      confidence?: number;
      significance_gate?: boolean;
      candidate_count?: number;
    };
    meta?: {
      reasoning_model?: string;
      activated_at?: string;
    };
  };
  const data = result.data;

  return {
    arcReasoningEventId: data.arc_reasoning_event_id ?? null,
    answer: data.answer ?? null,
    sources: data.sources ?? [],
    reasoningFieldsUsed: data.reasoning_fields_used ?? [],
    arcTypes: data.arc_types ?? [],
    confidence: data.confidence ?? 0,
    significanceGate: data.significance_gate ?? false,
    candidateCount: data.candidate_count ?? 0,
    reasoningModel: result.meta?.reasoning_model ?? null,
    activatedAt: result.meta?.activated_at ?? null,
  };
}
