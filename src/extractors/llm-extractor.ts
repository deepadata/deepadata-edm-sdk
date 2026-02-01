/**
 * LLM Extractor for EDM v0.4.0
 * Uses Anthropic Claude to extract emotional data from content
 * Based on proven extraction logic from system-prompt-B.ts, reconciled with canonical schema
 */
import Anthropic from "@anthropic-ai/sdk";
import type { LlmExtractedFields, ExtractionInput } from "../schema/types.js";
import { LlmExtractedFieldsSchema } from "../schema/edm-schema.js";

/**
 * System prompt for EDM extraction - Updated for v0.4.0 canonical schema
 * Reconciled field names from system-prompt-B.ts:
 * - archetype_energy → narrative_archetype
 * - meaning_inference → expressed_insight
 * - transcendent_moment → transformational_pivot
 * - REMOVED: active_motivational_state, media_context, memory_layers, tether_target, moral_valence
 * - reentry_score → recurrence_pattern (type changed: number → enum)
 * - ADDED: somatic_signature
 */
export const EXTRACTION_SYSTEM_PROMPT = `
You classify emotionally rich memories into a JSON object. Input may include text and an image.

Rules
- Fuse text + image. Treat text as primary; use image only to add grounded specifics (place, event, symbols, people).
- Keep fields to single words or short phrases (1–3 words). Only "narrative" is multi-sentence (3–5).
- No invention. If not supported by input, use null.
- Always include every top-level key and sub-key from the schema, even if the value is null or an empty array.
- Do not omit fields; if unknown, return null.
- Output JSON only — no commentary, markdown, or extra text.
- If motivation is ambiguous, choose the most conservative option (e.g., "curiosity" vs "fear") or return null.

Normalization (very important)
- Emit lowercase for all string fields except proper names in arrays like associated_people.
- For array fields (emotion_subtone, recall_triggers, retrieval_keys, nearby_themes, resilience_markers, associated_people):
  • use short tokens/phrases without punctuation;
  • avoid duplicates;
  • prefer singular nouns where reasonable ("tradition" not "traditions").
- Never put boolean-like strings ("true"/"false") into fields that are boolean; use real booleans.

Schema
{
  "core": {
    "anchor": "",            // central theme (e.g., "dad's toolbox", "nana's traditions")
    "spark": "",             // what triggered the memory (e.g., "finding the cassette", "first snow")
    "wound": "",             // emotional pain present (e.g., "loss", "regret", "distance")
    "fuel": "",              // what energized the experience (e.g., "shared laughter", "curiosity")
    "bridge": "",            // connection between past and present (e.g., "replaying old tape", "returning to the porch")
    "echo": "",              // what still resonates (e.g., "her laugh", "smell of oil", "city lights on water")
    "narrative": ""          // 3–5 sentences; include ≥1 sensory detail, ≥1 temporal cue, and a symbolic callback; faithful and concise
  },
  "constellation": {
    "emotion_primary": "",           // joy, sadness, anger, fear, wonder, peace, tenderness, reverence (best-fit; lowercase)
    "emotion_subtone": [],           // 2–4 short words (e.g., bittersweet, grateful)
    "higher_order_emotion": "",      // e.g., awe, forgiveness, pride, moral_elevation (or null)
    "meta_emotional_state": "",      // e.g., acceptance, confusion, curiosity (or null)
    "interpersonal_affect": "",      // e.g., warmth, openness, defensiveness (or null)
    "narrative_arc": "",             // overcoming, transformation, connection, reflection, closure (or null)
    "relational_dynamics": "",       // parent_child, romantic_partnership, sibling_bond, friendship, companionship, mentorship, reunion, community_ritual, grief, self_reflection (best-fit)
    "temporal_context": "",          // childhood, early_adulthood, midlife, late_life, recent, future, timeless (or null)
    "memory_type": "",               // legacy_artifact, fleeting_moment, milestone, reflection, formative_experience (or null)
    "media_format": "",              // photo, video, audio, text, photo_with_story (or null)
    "narrative_archetype": "",       // hero, caregiver, seeker, sage, lover, outlaw, innocent, magician, creator, everyman, jester, ruler, mentor (or null; lowercase)
    "symbolic_anchor": "",           // concrete object/place/ritual (or null)
    "relational_perspective": "",    // self, partner, family, friends, community, humanity (or null)
    "temporal_rhythm": "",           // choose ONE of: still, sudden, rising, fading, recurring, spiraling, dragging, suspended, looping, cyclic (or null)
    "identity_thread": "",           // short sentence
    "expressed_insight": "",         // brief insight explicitly stated by subject (extracted, not inferred)
    "transformational_pivot": false, // true if subject explicitly identifies this as life-changing
    "somatic_signature": ""          // bodily sensations explicitly described (e.g., "chest tightness", "warmth spreading") or null
  },
  "milky_way": {
    "event_type": "",                // e.g., family gathering, farewell, birthday (or null)
    "location_context": "",          // place from text or image (or null)
    "associated_people": [],         // names or roles (proper case allowed)
    "visibility_context": "",        // private, family_only, shared_publicly (or null)
    "tone_shift": ""                 // e.g., loss to gratitude (or null)
  },
  "gravity": {
    "emotional_weight": 0.0,         // 0.0–1.0 (felt intensity)
    "emotional_density": "",         // low, medium, high (or null)
    "valence": "",                   // positive, negative, mixed (or null)
    "viscosity": "",                 // low, medium, high, enduring, fluid (or null)
    "gravity_type": "",              // short phrase (e.g., symbolic resonance)
    "tether_type": "",               // choose ONE of: person, symbol, event, place, ritual, object, tradition (or null)
    "recall_triggers": [],           // sensory or symbolic cues (lowercase tokens)
    "retrieval_keys": [],            // compact hooks (3–6 tokens recommended)
    "nearby_themes": [],             // adjacent concepts
    "legacy_embed": false,
    "recurrence_pattern": "",        // cyclical, isolated, chronic, emerging (or null)
    "strength_score": 0.0,           // 0.0–1.0 (binding strength)
    "temporal_decay": "",            // fast, moderate, slow (or null)
    "resilience_markers": [],        // 1–3 (e.g., acceptance, optimism, continuity)
    "adaptation_trajectory": ""      // improving, stable, declining, integrative (or null)
  },
  "impulse": {
    "primary_energy": "",              // e.g., curiosity, fear, compassion (or null; lowercase)
    "drive_state": "",                 // explore, approach, avoid, repair, persevere, share (or null)
    "motivational_orientation": "",    // belonging, safety, mastery, meaning, autonomy (or null)
    "temporal_focus": "",              // past, present, future (or null)
    "directionality": "",              // inward, outward, transcendent (or null)
    "social_visibility": "",           // private, relational, collective (or null)
    "urgency": "",                     // calm, elevated, pressing, acute (or null)
    "risk_posture": "",                // cautious, balanced, bold (or null)
    "agency_level": "",                // low, medium, high (or null)
    "regulation_state": "",            // regulated, wavering, dysregulated (or null)
    "attachment_style": "",            // secure, anxious, avoidant, disorganized (or null)
    "coping_style": ""                 // choose ONE of: reframe_meaning, seek_support, distract, ritualize, confront, detach (or null)
  }

  // Calibration — Impulse (helps apply the fields consistently)
  // - temporal_focus: past (reminisce), present (here-and-now coping), future (plans/longing).
  // - directionality: inward (self-processing), outward (toward others), transcendent (beyond self).
  // - social_visibility: private (to self or 1:1), relational (friends/family), collective (community-wide).
  // - If uncertain, choose the most conservative option or null.
}
`;

export interface LlmExtractionResult {
  extracted: LlmExtractedFields;
  confidence: number;
  model: string;
  notes: string | null;
}

/**
 * Extract EDM fields from content using Anthropic Claude
 */
export async function extractWithLlm(
  client: Anthropic,
  input: ExtractionInput,
  model: string = "claude-sonnet-4-20250514"
): Promise<LlmExtractionResult> {
  const userContent: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  // Add text content
  if (input.text) {
    userContent.push({
      type: "text",
      text: input.text,
    });
  }

  // Add image if provided
  if (input.image) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: input.imageMediaType ?? "image/jpeg",
        data: input.image,
      },
    });
  }

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  // Extract text response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from LLM");
  }

  // Parse JSON response (strip markdown code fences if present)
  let jsonText = textBlock.text.trim();
  const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch?.[1]) {
    jsonText = fenceMatch[1].trim();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${textBlock.text.slice(0, 200)}...`);
  }

  // Validate against schema
  const result = LlmExtractedFieldsSchema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`LLM response failed schema validation: ${errorDetails}`);
  }

  // Calculate confidence based on field population
  const confidence = calculateConfidence(result.data);

  return {
    extracted: result.data,
    confidence,
    model,
    notes: null,
  };
}

/**
 * Calculate extraction confidence based on field population
 */
export function calculateConfidence(extracted: LlmExtractedFields): number {
  const weights = {
    core: 0.25,
    constellation: 0.25,
    milky_way: 0.15,
    gravity: 0.2,
    impulse: 0.15,
  };

  let totalScore = 0;

  // Core domain
  const coreFields = Object.values(extracted.core);
  const corePopulated = coreFields.filter((v) => v !== null && v !== "").length;
  totalScore += weights.core * (corePopulated / coreFields.length);

  // Constellation domain - check required and optional
  const constellationRequired = ["emotion_subtone", "transformational_pivot"];
  const constellationOptional = Object.keys(extracted.constellation).filter(
    (k) => !constellationRequired.includes(k)
  );
  const constellationPopulated =
    constellationOptional.filter((k) => {
      const val = extracted.constellation[k as keyof typeof extracted.constellation];
      return val !== null && val !== "";
    }).length + 2; // +2 for required fields
  totalScore += weights.constellation * (constellationPopulated / Object.keys(extracted.constellation).length);

  // MilkyWay domain
  const milkyWayPopulated = Object.values(extracted.milky_way).filter(
    (v) => v !== null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)
  ).length;
  totalScore += weights.milky_way * (milkyWayPopulated / Object.keys(extracted.milky_way).length);

  // Gravity domain
  const gravityPopulated = Object.values(extracted.gravity).filter(
    (v) => v !== null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)
  ).length;
  totalScore += weights.gravity * (gravityPopulated / Object.keys(extracted.gravity).length);

  // Impulse domain
  const impulsePopulated = Object.values(extracted.impulse).filter((v) => v !== null && v !== "").length;
  totalScore += weights.impulse * (impulsePopulated / Object.keys(extracted.impulse).length);

  return Math.round(totalScore * 100) / 100;
}

/**
 * Create an Anthropic client
 */
export function createAnthropicClient(apiKey?: string): Anthropic {
  return new Anthropic({
    apiKey: apiKey ?? process.env["ANTHROPIC_API_KEY"],
  });
}
