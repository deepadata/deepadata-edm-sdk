/**
 * EDM Artifact Assembler
 * Combines LLM-extracted fields with metadata to create complete artifacts
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EdmArtifact, ExtractionOptions, LlmExtractedFields } from "./schema/types.js";
import { extractWithLlm, createAnthropicClient } from "./extractors/llm-extractor.js";
import { extractWithOpenAI, createOpenAIClient } from "./extractors/openai-extractor.js";
import {
  createMeta,
  createGovernance,
  createTelemetry,
  createSystem,
  createCrosswalks,
  detectSourceType,
} from "./extractors/domain-extractors.js";

/**
 * Extract a complete EDM artifact from content
 */
export async function extractFromContent(options: ExtractionOptions): Promise<EdmArtifact> {
  const { content, metadata, model, provider = "anthropic" } = options;

  let llmResult;
  if (provider === "openai") {
    const client = createOpenAIClient();
    llmResult = await extractWithOpenAI(client, content, model);
  } else {
    const client = createAnthropicClient();
    llmResult = await extractWithLlm(client, content, model);
  }

  // Assemble complete artifact
  return assembleArtifact(llmResult.extracted, metadata, {
    confidence: llmResult.confidence,
    model: llmResult.model,
    notes: llmResult.notes,
    hasText: !!content.text,
    hasImage: !!content.image,
  });
}

/**
 * Extract from content with a provided Anthropic client
 */
export async function extractFromContentWithClient(
  client: Anthropic,
  options: ExtractionOptions
): Promise<EdmArtifact> {
  const { content, metadata, model } = options;

  // Extract with LLM
  const llmResult = await extractWithLlm(client, content, model);

  // Assemble complete artifact
  return assembleArtifact(llmResult.extracted, metadata, {
    confidence: llmResult.confidence,
    model: llmResult.model,
    notes: llmResult.notes,
    hasText: !!content.text,
    hasImage: !!content.image,
  });
}

interface AssemblyContext {
  confidence: number;
  model: string;
  notes: string | null;
  hasText: boolean;
  hasImage: boolean;
}

/**
 * Assemble a complete EDM artifact from extracted fields and metadata
 */
export function assembleArtifact(
  extracted: LlmExtractedFields,
  metadata: ExtractionOptions["metadata"],
  context: AssemblyContext
): EdmArtifact {
  const sourceType = detectSourceType(context.hasText, context.hasImage);

  return {
    meta: createMeta(metadata, sourceType),
    core: extracted.core,
    constellation: extracted.constellation,
    milky_way: extracted.milky_way,
    gravity: extracted.gravity,
    impulse: extracted.impulse,
    governance: createGovernance(metadata),
    telemetry: createTelemetry(context.confidence, context.model, context.notes),
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
      version: "0.4.0",
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
      legacy_embed: false,
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
      extraction_notes: null,
      alignment_delta: null,
    },
    system: {
      embeddings: [],
      indices: {
        waypoint_ids: [],
        sector_weights: {
          episodic: 0,
          semantic: 0,
          procedural: 0,
          emotional: 0,
          reflective: 0,
        },
      },
    },
    crosswalks: {
      plutchik_primary: null,
      geneva_emotion_wheel: null,
      DSM5_specifiers: null,
      HMD_v2_memory_type: null,
      ISO_27557_labels: null,
    },
  };
}
