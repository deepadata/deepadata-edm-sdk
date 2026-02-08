/**
 * LLM Extractor for EDM v0.4.0
 * Uses Anthropic Claude to extract emotional data from content
 * Based on proven extraction logic from system-prompt-B.ts, reconciled with canonical schema
 */
import Anthropic from "@anthropic-ai/sdk";
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

CRITICAL: Enum Field Constraints
- Many fields below are STRICT ENUMS with a fixed set of allowed values.
- You MUST use ONLY the values listed in the enum sets. Do not invent similar values.
- Cross-contamination warning: Each enum field has its own distinct value set. Do not use values from one field in another.
  Example: "milestone" is valid for memory_type but NOT for narrative_arc.
  Example: "confront" is valid for both drive_state and coping_style - check which field you're populating.
- If none of the allowed enum values adequately capture the expressed content, use the closest match. Do not invent alternatives.

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
    "emotion_primary": "",           // STRICT ENUM: joy | sadness | fear | anger | wonder | peace | tenderness | reverence | pride | anxiety | gratitude | longing | hope (pick best-fit from these 13 ONLY)
    "emotion_subtone": [],           // 2–4 short words (e.g., bittersweet, grateful) — free text array
    "higher_order_emotion": "",      // free text: e.g., awe, forgiveness, pride, moral_elevation (or null)
    "meta_emotional_state": "",      // free text: e.g., acceptance, confusion, curiosity (or null)
    "interpersonal_affect": "",      // free text: e.g., warmth, openness, defensiveness (or null)
    "narrative_arc": "",             // STRICT ENUM: overcoming | transformation | connection | reflection | closure (pick ONE or null)
    "relational_dynamics": "",       // STRICT ENUM: parent_child | romantic_partnership | sibling_bond | family | friendship | companionship | mentorship | reunion | community_ritual | grief | self_reflection | professional | therapeutic | service | adversarial (pick ONE)
    "temporal_context": "",          // STRICT ENUM: childhood | early_adulthood | midlife | late_life | recent | future | timeless (pick ONE or null)
    "memory_type": "",               // STRICT ENUM: legacy_artifact | fleeting_moment | milestone | reflection | formative_experience (pick ONE or null)
    "media_format": "",              // photo, video, audio, text, photo_with_story (or null)
    "narrative_archetype": "",       // STRICT ENUM: hero | caregiver | seeker | sage | lover | outlaw | innocent | magician | creator | everyman | jester | ruler | mentor (pick ONE or null; lowercase)
    "symbolic_anchor": "",           // concrete object/place/ritual (or null)
    "relational_perspective": "",    // STRICT ENUM: self | partner | family | friends | community | humanity (pick ONE or null)
    "temporal_rhythm": "",           // STRICT ENUM: still | sudden | rising | fading | recurring | spiraling | dragging | suspended | looping | cyclic (pick ONE or null)
    "identity_thread": "",           // short sentence
    "expressed_insight": "",         // brief insight explicitly stated by subject (extracted, not inferred)
    "transformational_pivot": false, // true if subject explicitly identifies this as life-changing
    "somatic_signature": ""          // bodily sensations explicitly described (e.g., "chest tightness", "warmth spreading") or null
  },
  "milky_way": {
    "event_type": "",                // e.g., family gathering, farewell, birthday (or null)
    "location_context": "",          // place from text or image (or null)
    "associated_people": [],         // names or roles (proper case allowed)
    "visibility_context": "",        // STRICT ENUM: private | family_only | shared_publicly (pick ONE or null)
    "tone_shift": ""                 // e.g., loss to gratitude (or null)
  },
  "gravity": {
    "emotional_weight": 0.0,         // 0.0–1.0 (felt intensity)
    "emotional_density": "",         // STRICT ENUM: low | medium | high (pick ONE or null)
    "valence": "",                   // STRICT ENUM: positive | negative | mixed (pick ONE or null)
    "viscosity": "",                 // STRICT ENUM: low | medium | high | enduring | fluid (pick ONE or null)
    "gravity_type": "",              // short phrase (e.g., symbolic resonance)
    "tether_type": "",               // STRICT ENUM: person | symbol | event | place | ritual | object | tradition (pick ONE or null)
    "recall_triggers": [],           // sensory or symbolic cues (lowercase tokens)
    "retrieval_keys": [],            // compact hooks (3–6 tokens recommended)
    "nearby_themes": [],             // adjacent concepts
    "legacy_embed": false,
    "recurrence_pattern": "",        // STRICT ENUM: cyclical | isolated | chronic | emerging (pick ONE or null)
    "strength_score": 0.0,           // 0.0–1.0 (binding strength)
    "temporal_decay": "",            // STRICT ENUM: fast | moderate | slow (pick ONE or null)
    "resilience_markers": [],        // 1–3 (e.g., acceptance, optimism, continuity)
    "adaptation_trajectory": ""      // STRICT ENUM: improving | stable | declining | integrative (pick ONE or null)
  },
  "impulse": {
    "primary_energy": "",              // free text: e.g., curiosity, fear, compassion (or null; lowercase)
    "drive_state": "",                 // STRICT ENUM: explore | approach | avoid | repair | persevere | share | confront | protect | process (pick ONE or null)
    "motivational_orientation": "",    // STRICT ENUM: belonging | safety | mastery | meaning | autonomy (pick ONE or null)
    "temporal_focus": "",              // STRICT ENUM: past | present | future (pick ONE or null)
    "directionality": "",              // STRICT ENUM: inward | outward | transcendent (pick ONE or null)
    "social_visibility": "",           // STRICT ENUM: private | relational | collective (pick ONE or null)
    "urgency": "",                     // STRICT ENUM: calm | elevated | pressing | acute (pick ONE or null)
    "risk_posture": "",                // STRICT ENUM: cautious | balanced | bold (pick ONE or null)
    "agency_level": "",                // STRICT ENUM: low | medium | high (pick ONE or null)
    "regulation_state": "",            // STRICT ENUM: regulated | wavering | dysregulated (pick ONE or null)
    "attachment_style": "",            // STRICT ENUM: secure | anxious | avoidant | disorganized (pick ONE or null)
    "coping_style": ""                 // STRICT ENUM: reframe_meaning | seek_support | distract | ritualize | confront | detach (pick ONE or null)
  }

  // Calibration — Impulse (helps apply the fields consistently)
  // - temporal_focus: past (reminisce), present (here-and-now coping), future (plans/longing).
  // - directionality: inward (self-processing), outward (toward others), transcendent (beyond self).
  // - social_visibility: private (to self or 1:1), relational (friends/family), collective (community-wide).
  // - If uncertain, choose the most conservative option or null.

  // CROSS-CONTAMINATION DISAMBIGUATION (read carefully)
  //
  // temporal_rhythm vs urgency:
  //   - temporal_rhythm describes the CADENCE or PACE of time in the memory experience
  //     (still, sudden, rising, fading, recurring, spiraling, dragging, suspended, looping, cyclic)
  //   - urgency describes the INTENSITY of motivational pressure RIGHT NOW
  //     (calm, elevated, pressing, acute)
  //   - "pressing" belongs ONLY in urgency, NEVER in temporal_rhythm
  //
  // temporal_rhythm vs viscosity:
  //   - temporal_rhythm is about TIME MOVEMENT in the memory
  //   - viscosity is about EMOTIONAL PERSISTENCE over time
  //     (low=fleeting, medium=moderate, high=sticky, enduring=long-lasting, fluid=changeable)
  //   - "enduring" belongs ONLY in viscosity, NEVER in temporal_rhythm
  //
  // relational_dynamics vs relational_perspective:
  //   - relational_dynamics: the TYPE of relationship (parent_child, friendship, mentorship, etc.)
  //   - relational_perspective: WHOSE viewpoint the narrative is told from (self, partner, family, etc.)
  //   - "family" can appear in BOTH fields with different meanings
  //
  // drive_state vs coping_style:
  //   - drive_state: the MOTIVATIONAL direction (explore, approach, avoid, confront, etc.)
  //   - coping_style: the STRATEGY for managing emotions (reframe_meaning, seek_support, confront, etc.)
  //   - "confront" is valid in BOTH - use drive_state for action impulse, coping_style for emotion management
  //
  // emotion_primary (STRICT ENUM) vs higher_order_emotion (free text):
  //   - emotion_primary MUST be one of the 13 listed values ONLY
  //   - Do NOT put free-text emotions like "compassion", "reflection", "frustration" in emotion_primary
  //   - Use higher_order_emotion for complex emotions not in the primary list
}
`;
/**
 * Extract EDM fields from content using Anthropic Claude
 */
export async function extractWithLlm(client, input, model = "claude-sonnet-4-20250514") {
    const userContent = [];
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
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    }
    catch {
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
export function calculateConfidence(extracted) {
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
    const constellationOptional = Object.keys(extracted.constellation).filter((k) => !constellationRequired.includes(k));
    const constellationPopulated = constellationOptional.filter((k) => {
        const val = extracted.constellation[k];
        return val !== null && val !== "";
    }).length + 2; // +2 for required fields
    totalScore += weights.constellation * (constellationPopulated / Object.keys(extracted.constellation).length);
    // MilkyWay domain
    const milkyWayPopulated = Object.values(extracted.milky_way).filter((v) => v !== null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)).length;
    totalScore += weights.milky_way * (milkyWayPopulated / Object.keys(extracted.milky_way).length);
    // Gravity domain
    const gravityPopulated = Object.values(extracted.gravity).filter((v) => v !== null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)).length;
    totalScore += weights.gravity * (gravityPopulated / Object.keys(extracted.gravity).length);
    // Impulse domain
    const impulsePopulated = Object.values(extracted.impulse).filter((v) => v !== null && v !== "").length;
    totalScore += weights.impulse * (impulsePopulated / Object.keys(extracted.impulse).length);
    return Math.round(totalScore * 100) / 100;
}
/**
 * Create an Anthropic client
 */
export function createAnthropicClient(apiKey) {
    return new Anthropic({
        apiKey: apiKey ?? process.env["ANTHROPIC_API_KEY"],
    });
}
//# sourceMappingURL=llm-extractor.js.map