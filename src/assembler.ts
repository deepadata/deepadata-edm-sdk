/**
 * EDM Artifact Assembler
 * Combines LLM-extracted fields with metadata to create complete artifacts
 * Enforces exact field-level profile filtering per EDM spec
 * EDM schema version is declared in src/version.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import type OpenAI from "openai";
import type { EdmArtifact, ExtractionOptions, LlmExtractedFields, EdmProfile, PartnerProfileId, ExperientialStance } from "./schema/types.js";
import { EDM_SCHEMA_VERSION } from "./version.js";
import { extractWithLlm, createAnthropicClient } from "./extractors/llm-extractor.js";
import { extractWithOpenAI, createOpenAIClient } from "./extractors/openai-extractor.js";
import { extractWithKimi, createKimiClient, getKimiModelId } from "./extractors/kimi-extractor.js";
import {
  takeStance,
  applyStanceGuard,
  resolveStance,
  classifyStanceOpenAI,
  classifyStanceAnthropic,
} from "./extractors/stance-guard.js";
import {
  chunkConversation,
  type ConversationMessage,
  type ChunkConversationOptions,
} from "./conversation.js";
import {
  createMeta,
  createGovernance,
  createTelemetry,
  createSystem,
  createCrosswalks,
  detectSourceType,
} from "./extractors/domain-extractors.js";

// =============================================================================
// Profile Field Definitions
// =============================================================================

/**
 * Essential Profile: 5 domains, 24 fields
 * Target: memory platforms, agent frameworks, AI assistants
 */
export const ESSENTIAL_PROFILE_FIELDS = {
  meta: [
    "id", "version", "profile", "created_at", "updated_at", "locale",
    "owner_user_id", "parent_id", "visibility", "pii_tier", "consent_basis"
  ],
  core: ["anchor", "spark", "wound", "fuel", "bridge", "echo"],
  constellation: ["emotion_primary", "emotion_subtone", "narrative_arc"],
  governance: ["jurisdiction", "retention_policy", "subject_rights"],
  telemetry: ["entry_confidence", "extraction_model"],
} as const;

/**
 * Extended Profile: 8 domains, ~50 fields
 * Target: journaling apps, companion AI, workplace wellness
 */
/**
 * Extended Profile: 7 domains, 50 fields
 * Target: journaling apps, companion AI, workplace wellness
 * Impulse domain is NOT included in Extended profile
 */
export const EXTENDED_PROFILE_FIELDS = {
  meta: [
    "id", "version", "profile", "created_at", "updated_at", "locale",
    "owner_user_id", "parent_id", "visibility", "pii_tier", "source_type",
    "source_context", "consent_basis", "consent_scope", "tags"
  ],
  core: ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"],
  constellation: [
    "emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state",
    "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context",
    "memory_type", "media_format", "narrative_archetype", "symbolic_anchor",
    "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight",
    "transformational_pivot", "somatic_signature"
  ],
  milky_way: ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"],
  gravity: ["emotional_weight", "valence", "tether_type", "recurrence_pattern", "strength_score"],
  governance: ["jurisdiction", "retention_policy", "subject_rights"],
  telemetry: ["entry_confidence", "extraction_model"],
} as const;

/**
 * Full Profile: all 10 domains, all fields
 * Target: therapy platforms, clinical tools, regulated systems
 */
export const FULL_PROFILE_FIELDS = {
  meta: [
    "id", "version", "profile", "created_at", "updated_at", "locale",
    "owner_user_id", "parent_id", "visibility", "pii_tier", "source_type",
    "source_context", "consent_basis", "consent_scope", "consent_revoked_at", "tags"
  ],
  core: ["anchor", "spark", "wound", "fuel", "bridge", "echo", "narrative"],
  constellation: [
    "emotion_primary", "emotion_subtone", "higher_order_emotion", "meta_emotional_state",
    "interpersonal_affect", "narrative_arc", "relational_dynamics", "temporal_context",
    "memory_type", "media_format", "narrative_archetype", "symbolic_anchor",
    "relational_perspective", "temporal_rhythm", "identity_thread", "expressed_insight",
    "transformational_pivot", "somatic_signature"
  ],
  milky_way: ["event_type", "location_context", "associated_people", "visibility_context", "tone_shift"],
  gravity: [
    "emotional_weight", "emotional_density", "valence", "viscosity", "gravity_type",
    "tether_type", "recall_triggers", "retrieval_keys", "nearby_themes",
    "recurrence_pattern", "strength_score", "temporal_decay", "resilience_markers", "adaptation_trajectory"
  ],
  impulse: [
    "primary_energy", "drive_state", "motivational_orientation", "temporal_focus",
    "directionality", "social_visibility", "urgency", "risk_posture",
    "agency_level", "regulation_state", "attachment_style", "coping_style"
  ],
  governance: [
    "jurisdiction", "retention_policy", "subject_rights", "exportability",
    "k_anonymity", "policy_labels", "masking_rules"
  ],
  telemetry: [
    "entry_confidence", "extraction_model", "extraction_provider",
    "extraction_notes"
  ],
  system: ["embeddings", "indices"],
  crosswalks: [
    "plutchik_primary", "geneva_emotion_wheel", "DSM5_specifiers",
    "ISO_27557_labels"
  ],
} as const;

/**
 * Get profile field definitions
 */
export function getProfileFields(profile: EdmProfile): Record<string, readonly string[]> {
  switch (profile) {
    case "essential":
      return ESSENTIAL_PROFILE_FIELDS;
    case "extended":
      return EXTENDED_PROFILE_FIELDS;
    case "full":
      return FULL_PROFILE_FIELDS;
    default:
      // Partner profile — return extended base fields pending registry lookup (ADR-0012)
      return EXTENDED_PROFILE_FIELDS;
  }
}

/**
 * Get domains included in a profile
 */
export function getProfileDomains(profile: EdmProfile): string[] {
  return Object.keys(getProfileFields(profile));
}

// =============================================================================
// Profile Type Guards (ADR-0017)
// =============================================================================

/**
 * Check if profile is one of the canonical profiles (essential/extended/full)
 */
export function isCanonicalProfile(profile: string): profile is "essential" | "extended" | "full" {
  return ["essential", "extended", "full"].includes(profile);
}

/**
 * Check if profile is a partner profile (prefixed with "partner:")
 */
export function isPartnerProfile(profile: string): profile is PartnerProfileId {
  return profile.startsWith("partner:");
}

/**
 * Extract the profile ID from a partner profile string
 * Returns null if not a partner profile
 */
export function getPartnerProfileId(profile: string): string | null {
  return profile.startsWith("partner:") ? profile.slice(8) : null;
}

// =============================================================================
// Profile Filtering
// =============================================================================

/**
 * Filter an object to include only specified fields
 */
function filterObjectFields<T extends Record<string, unknown>>(
  obj: T,
  allowedFields: readonly string[]
): Partial<T> {
  const filtered: Partial<T> = {};
  for (const field of allowedFields) {
    if (field in obj) {
      (filtered as Record<string, unknown>)[field] = obj[field];
    }
  }
  return filtered;
}

/**
 * Filter nested governance fields for Essential/Extended profiles
 */
function filterGovernanceFields(
  governance: Record<string, unknown>,
  allowedFields: readonly string[]
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in governance) {
      const value = governance[field];

      // For retention_policy, filter to basis, ttl_days, on_expiry only
      if (field === "retention_policy" && value && typeof value === "object") {
        const rp = value as Record<string, unknown>;
        filtered[field] = {
          basis: rp.basis,
          ttl_days: rp.ttl_days,
          on_expiry: rp.on_expiry,
        };
      }
      // For subject_rights, filter to portable, erasable, explainable only
      else if (field === "subject_rights" && value && typeof value === "object") {
        const sr = value as Record<string, unknown>;
        filtered[field] = {
          portable: sr.portable,
          erasable: sr.erasable,
          explainable: sr.explainable,
        };
      }
      else {
        filtered[field] = value;
      }
    }
  }

  return filtered;
}

/**
 * Filter artifact to include only fields defined for the declared profile
 * Per EDM Profile Invariants: out-of-profile fields MUST be omitted entirely
 */
export function filterByProfile(
  artifact: Record<string, unknown>,
  profile: EdmProfile
): Record<string, unknown> {
  const profileFields = getProfileFields(profile);
  const filtered: Record<string, unknown> = {};

  for (const [domain, fields] of Object.entries(profileFields)) {
    const domainData = artifact[domain];
    if (domainData && typeof domainData === "object") {
      if (domain === "governance") {
        filtered[domain] = filterGovernanceFields(
          domainData as Record<string, unknown>,
          fields
        );
      } else {
        filtered[domain] = filterObjectFields(
          domainData as Record<string, unknown>,
          fields
        );
      }
    }
  }

  return filtered;
}

// =============================================================================
// Extraction API
// =============================================================================

/**
 * Profile-specific extracted fields (union type)
 */
type ProfileExtractedFields = Record<string, unknown>;

/**
 * Stance handling shared by extractFromContent and the with-client variant.
 * Pulls experiential_stance out of the extracted fields, optionally verifies
 * it with a cheap classifier call, applies the deterministic guard, and
 * returns a telemetry note describing what happened.
 */
async function applyAttributionGuard(params: {
  extracted: Record<string, unknown>;
  content: ExtractionOptions["content"];
  verifyStance: boolean | "auto";
  classify: ((summary: string) => Promise<ExperientialStance | null>) | null;
}): Promise<{ stance: ExperientialStance | null; note: string }> {
  const { extracted, content, verifyStance, classify } = params;

  const claimedStance = takeStance(extracted);
  let stance = claimedStance;
  const noteParts: string[] = [];

  const gravity = extracted["gravity"] as Record<string, unknown> | undefined;
  const hasGravity = !!gravity && typeof gravity === "object";
  const weight = hasGravity && typeof gravity["emotional_weight"] === "number" ? (gravity["emotional_weight"] as number) : 0;

  // "auto" scopes the classifier to high-weight (>=0.6) lived/witnessed/null
  // conversation extractions on gravity-bearing profiles. Gravity-less
  // profiles (essential) have no emotional_weight to gate on; there "auto"
  // fires ONLY when extraction returned no stance at all — essential is the
  // coherence-tier profile for transient, typically-unsealed artifacts, the
  // deterministic guard below already demotes non-subject stances, and
  // always-on verification would double cost/latency in the partner hot
  // path. Callers wanting unconditional verification pass verifyStance: true.
  const autoTrigger = hasGravity
    ? (stance === "lived" || stance === "witnessed" || stance === null) && weight >= 0.6
    : stance === null;
  const shouldVerify =
    verifyStance === true ||
    (verifyStance === "auto" && content.inputType === "conversation" && autoTrigger);

  if (shouldVerify && classify && content.text) {
    const core = extracted["core"] as Record<string, unknown> | undefined;
    const summary =
      (typeof core?.["narrative"] === "string" && core["narrative"]) ||
      ["anchor", "wound", "echo"]
        .map((f) => (core?.[f] ? `${f}: ${core[f]}` : null))
        .filter(Boolean)
        .join("; ") ||
      "(no summary extracted)";
    try {
      const classified = await classify(summary);
      const resolved = resolveStance(claimedStance, classified);
      if (resolved !== claimedStance) {
        stance = resolved;
        noteParts.push(`stance_classifier_override=${classified} (claimed ${claimedStance ?? "null"})`);
      }
    } catch (err) {
      // Verification is best-effort: a failed classifier call must not
      // drop the artifact. The deterministic guard still applies below.
      noteParts.push(`stance_verify_failed: ${err instanceof Error ? err.message.slice(0, 120) : "error"}`);
    }
  }

  const cleared = applyStanceGuard(extracted, stance);
  noteParts.unshift(`experiential_stance=${stance ?? "null"}`);
  if (cleared.length > 0) {
    noteParts.push(`stance_guard_cleared: ${cleared.join(", ")}`);
  }

  return { stance, note: noteParts.join("; ") };
}

function mergeNotes(...notes: (string | null | undefined)[]): string | null {
  const merged = notes.filter(Boolean).join("; ");
  return merged.length > 0 ? merged : null;
}

/**
 * Extract a complete EDM artifact from content
 *
 * @param options - Extraction options including profile
 * @returns Profile-conformant EDM artifact
 */
export async function extractFromContent(options: ExtractionOptions): Promise<Record<string, unknown>> {
  const {
    content,
    metadata,
    model,
    provider = "kimi",
    temperature,
    profile = "full",
    maxTokens,
    verifyStance = "auto",
  } = options;
  const callOptions = { maxTokens };

  let llmResult;
  let classify: ((summary: string) => Promise<ExperientialStance | null>) | null = null;

  if (provider === "openai") {
    const client = createOpenAIClient();
    llmResult = await extractWithOpenAI(client, content, model, temperature, profile, callOptions);
    classify = makeOpenAICompatibleClassifier(client, llmResult.model, content.text);
  } else if (provider === "kimi") {
    const client = createKimiClient();
    llmResult = await extractWithKimi(client, content, model ?? getKimiModelId(), profile, callOptions);
    classify = makeOpenAICompatibleClassifier(client, llmResult.model, content.text);
  } else {
    const client = createAnthropicClient();
    llmResult = await extractWithLlm(client, content, model, profile, callOptions);
    classify = makeAnthropicClassifier(client, llmResult.model, content.text);
  }

  const extracted = llmResult.extracted as ProfileExtractedFields;
  const { note: stanceNote } = await applyAttributionGuard({
    extracted: extracted as Record<string, unknown>,
    content,
    verifyStance,
    classify,
  });

  // Assemble profile-specific artifact
  const artifact = assembleProfileArtifact(
    extracted,
    metadata,
    {
      confidence: llmResult.confidence,
      model: llmResult.model,
      profile: llmResult.profile,
      provider,
      notes: mergeNotes(llmResult.notes, stanceNote),
      hasText: !!content.text,
      hasImage: !!content.image,
    }
  );

  return artifact;
}

function makeOpenAICompatibleClassifier(
  client: OpenAI,
  model: string,
  sourceText: string | undefined
): ((summary: string) => Promise<ExperientialStance | null>) | null {
  if (!sourceText) return null;
  return (summary) => classifyStanceOpenAI(client, model, { sourceText, extractedSummary: summary });
}

function makeAnthropicClassifier(
  client: Anthropic,
  model: string,
  sourceText: string | undefined
): ((summary: string) => Promise<ExperientialStance | null>) | null {
  if (!sourceText) return null;
  return (summary) => classifyStanceAnthropic(client, model, { sourceText, extractedSummary: summary });
}

// =============================================================================
// Conversation Extraction (per_session chunking)
// =============================================================================

export interface ConversationExtractionOptions extends Omit<ExtractionOptions, "content"> {
  /** Parsed conversation messages (caller's export parser supplies these) */
  messages: ConversationMessage[];
  /** Chunking controls; defaults to 48K chars per chunk, turn-aligned */
  chunking?: ChunkConversationOptions;
}

export interface ConversationChunkArtifact {
  artifact: Record<string, unknown>;
  /** Which slice of the conversation this artifact covers */
  chunk: { index: number; turnRange: [number, number] };
}

/**
 * Extract EDM artifacts from a full conversation with per_session chunking.
 *
 * Replaces caller-side head+tail truncation: the conversation is split into
 * full-coverage, turn-aligned chunks (chunkConversation), each chunk is
 * extracted as a conversation input (framed, subject-anchored, stance-guarded),
 * and chunks after the first are threaded to the first chunk's artifact via
 * metadata.parentId. meta.parent_id is defined in ALL profile schemas
 * (essential, extended, full) per the published v0.8.0 schema set, so the
 * linkage appears in the artifact body for every profile — populated for
 * chunks past the first, explicit null otherwise (whitepaper §5.2 No
 * Omission). Short conversations produce exactly one artifact.
 */
export async function extractFromConversation(
  options: ConversationExtractionOptions
): Promise<ConversationChunkArtifact[]> {
  const { messages, chunking, metadata, ...rest } = options;
  const chunks = chunkConversation(messages, chunking);

  const results: ConversationChunkArtifact[] = [];
  let threadParentId: string | null = null;

  for (const chunk of chunks) {
    const chunkMetadata = threadParentId ? { ...metadata, parentId: threadParentId } : metadata;
    const artifact = await extractFromContent({
      ...rest,
      metadata: chunkMetadata,
      content: { text: chunk.text, inputType: "conversation" },
    });
    if (threadParentId === null) {
      const id = (artifact["meta"] as Record<string, unknown> | undefined)?.["id"];
      if (typeof id === "string") threadParentId = id;
    }
    results.push({ artifact, chunk: { index: chunk.index, turnRange: chunk.turnRange } });
  }

  return results;
}

/**
 * Extract from content with a provided Anthropic client
 */
export async function extractFromContentWithClient(
  client: Anthropic,
  options: ExtractionOptions
): Promise<Record<string, unknown>> {
  const { content, metadata, model, profile = "full", maxTokens, verifyStance = "auto" } = options;

  // Extract with LLM
  const llmResult = await extractWithLlm(client, content, model, profile, { maxTokens });

  const extracted = llmResult.extracted as ProfileExtractedFields;
  const { note: stanceNote } = await applyAttributionGuard({
    extracted: extracted as Record<string, unknown>,
    content,
    verifyStance,
    classify: makeAnthropicClassifier(client, llmResult.model, content.text),
  });

  // Assemble profile-specific artifact
  const artifact = assembleProfileArtifact(
    extracted,
    metadata,
    {
      confidence: llmResult.confidence,
      model: llmResult.model,
      profile: llmResult.profile,
      provider: 'anthropic',
      notes: mergeNotes(llmResult.notes, stanceNote),
      hasText: !!content.text,
      hasImage: !!content.image,
    }
  );

  return artifact;
}

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
export function assembleProfileArtifact(
  extracted: ProfileExtractedFields,
  metadata: ExtractionOptions["metadata"],
  context: AssemblyContext
): Record<string, unknown> {
  const sourceType = detectSourceType(context.hasText, context.hasImage);
  const profile = context.profile;
  const profileFields = getProfileFields(profile);

  // Create metadata domains
  const meta = createMeta(metadata, sourceType, profile);
  const governance = createGovernance(metadata);
  const telemetry = createTelemetry(context.confidence, context.model, context.notes, context.provider);

  // Build artifact with only profile-specific domains
  const artifact: Record<string, unknown> = {
    meta: filterObjectFields(meta, profileFields.meta ?? []),
    core: extracted.core,
    constellation: extracted.constellation,
    governance: filterGovernanceFields(governance as Record<string, unknown>, profileFields.governance ?? []),
    telemetry: filterObjectFields(telemetry, profileFields.telemetry ?? []),
  };

  // Add extended/full domains if present in extracted data
  if (extracted.milky_way) {
    artifact.milky_way = extracted.milky_way;
  }
  if (extracted.gravity) {
    artifact.gravity = extracted.gravity;
  }
  if (extracted.impulse) {
    artifact.impulse = extracted.impulse;
  }

  // Add full-only domains
  if (profile === "full") {
    artifact.system = createSystem();
    artifact.crosswalks = createCrosswalks(extracted as unknown as LlmExtractedFields);
  }

  return artifact;
}

/**
 * Assemble a complete EDM artifact from extracted fields and metadata
 * Note: Returns full artifact structure; use filterByProfile to strip out-of-profile fields
 * @deprecated Use assembleProfileArtifact for profile-aware assembly
 */
export function assembleArtifact(
  extracted: LlmExtractedFields,
  metadata: ExtractionOptions["metadata"],
  context: AssemblyContext
): EdmArtifact {
  const sourceType = detectSourceType(context.hasText, context.hasImage);

  return {
    meta: createMeta(metadata, sourceType, context.profile),
    core: extracted.core,
    constellation: extracted.constellation,
    milky_way: extracted.milky_way,
    gravity: extracted.gravity,
    impulse: extracted.impulse,
    governance: createGovernance(metadata),
    telemetry: createTelemetry(context.confidence, context.model, context.notes, context.provider),
    system: createSystem(),
    crosswalks: createCrosswalks(extracted),
  };
}

/**
 * Create an empty EDM artifact structure (for manual population)
 */
export function createEmptyArtifact(): EdmArtifact {
  return {
    meta: {
      id: null,
      version: EDM_SCHEMA_VERSION,
      profile: "full",
      created_at: new Date().toISOString(),
      updated_at: null,
      locale: null,
      owner_user_id: null,
      parent_id: null,
      visibility: "private",
      pii_tier: "none",
      source_type: "text",
      source_context: null,
      consent_basis: "none",
      consent_scope: null,
      consent_revoked_at: null,
      tags: [],
    },
    core: {
      anchor: null,
      spark: null,
      wound: null,
      fuel: null,
      bridge: null,
      echo: null,
      narrative: null,
    },
    constellation: {
      emotion_primary: null,
      emotion_subtone: [],
      higher_order_emotion: null,
      meta_emotional_state: null,
      interpersonal_affect: null,
      narrative_arc: null,
      relational_dynamics: null,
      temporal_context: null,
      memory_type: null,
      media_format: null,
      narrative_archetype: null,
      symbolic_anchor: null,
      relational_perspective: null,
      temporal_rhythm: null,
      identity_thread: null,
      expressed_insight: null,
      transformational_pivot: false,
      somatic_signature: null,
    },
    milky_way: {
      event_type: null,
      location_context: null,
      associated_people: [],
      visibility_context: null,
      tone_shift: null,
    },
    gravity: {
      emotional_weight: 0,
      emotional_density: null,
      valence: null,
      viscosity: null,
      gravity_type: null,
      tether_type: null,
      recall_triggers: [],
      retrieval_keys: [],
      nearby_themes: [],
      recurrence_pattern: null,
      strength_score: 0,
      temporal_decay: null,
      resilience_markers: null,
      adaptation_trajectory: null,
    },
    impulse: {
      primary_energy: null,
      drive_state: null,
      motivational_orientation: null,
      temporal_focus: null,
      directionality: null,
      social_visibility: null,
      urgency: null,
      risk_posture: null,
      agency_level: null,
      regulation_state: null,
      attachment_style: null,
      coping_style: null,
    },
    governance: {
      jurisdiction: null,
      retention_policy: null,
      subject_rights: {
        portable: true,
        erasable: true,
        explainable: false,
      },
      exportability: "allowed",
      k_anonymity: null,
      policy_labels: ["none"],
      masking_rules: [],
    },
    telemetry: {
      entry_confidence: 0,
      extraction_model: null,
      extraction_provider: null,
      extraction_notes: null,
    },
    system: {
      embeddings: [],
      indices: {
        waypoint_ids: [],
      },
    },
    crosswalks: {
      plutchik_primary: null,
      geneva_emotion_wheel: null,
      DSM5_specifiers: null,
      ISO_27557_labels: null,
    },
  };
}
