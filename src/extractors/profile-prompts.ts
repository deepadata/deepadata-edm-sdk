/**
 * Profile-specific extraction prompts for EDM v0.6.0
 *
 * Essential Profile: ~20 required fields for memory platforms
 * Extended Profile: ~45 fields for journaling apps
 * Full Profile: all 96 fields for therapy/clinical tools
 */

import type { EdmProfile } from "../schema/types.js";

/**
 * Essential Profile System Prompt (~20 fields)
 * Target: memory platforms, agent frameworks, AI assistants
 */
export const ESSENTIAL_PROFILE_PROMPT = `
You classify emotionally rich memories into a JSON object. Input may include text and an image.

PROFILE: ESSENTIAL (~20 fields)
This is a minimal extraction for memory platforms. Focus ONLY on the required fields.
All other fields should be explicitly null.

Rules
- Fuse text + image. Treat text as primary; use image only to add grounded specifics.
- Keep fields to single words or short phrases (1–3 words). Only "narrative" is multi-sentence (3–5).
- No invention. If not supported by input, use null.
- Output JSON only — no commentary, markdown, or extra text.
- Emit lowercase for all string fields except proper names.

ESSENTIAL PROFILE SCHEMA (extract these fields ONLY):
{
  "core": {
    "anchor": "",            // central theme
    "spark": "",             // what triggered the memory
    "wound": "",             // vulnerability or loss (or null)
    "fuel": "",              // what energized the experience
    "bridge": "",            // connection between past and present
    "echo": "",              // what still resonates
    "narrative": ""          // 3–5 sentences
  },
  "constellation": {
    "emotion_primary": "",   // STRICT ENUM: joy | sadness | fear | anger | wonder | peace | tenderness | reverence | pride | anxiety | gratitude | longing | hope | shame
    "emotion_subtone": [],   // 2–4 short words
    "narrative_arc": "",     // STRICT ENUM: overcoming | transformation | connection | reflection | closure
    // ALL OTHER constellation fields must be null
    "higher_order_emotion": null,
    "meta_emotional_state": null,
    "interpersonal_affect": null,
    "relational_dynamics": null,
    "temporal_context": null,
    "memory_type": null,
    "media_format": null,
    "narrative_archetype": null,
    "symbolic_anchor": null,
    "relational_perspective": null,
    "temporal_rhythm": null,
    "identity_thread": null,
    "expressed_insight": null,
    "transformational_pivot": false,
    "somatic_signature": null
  },
  "milky_way": {
    "event_type": null,
    "location_context": null,
    "associated_people": [],
    "visibility_context": null,
    "tone_shift": null
  },
  "gravity": {
    "emotional_weight": 0.0,
    "emotional_density": null,
    "valence": null,
    "viscosity": null,
    "gravity_type": null,
    "tether_type": null,
    "recall_triggers": [],
    "retrieval_keys": [],
    "nearby_themes": [],
    "legacy_embed": false,
    "recurrence_pattern": null,
    "strength_score": 0.0,
    "temporal_decay": null,
    "resilience_markers": null,
    "adaptation_trajectory": null
  },
  "impulse": {
    "primary_energy": null,
    "drive_state": null,
    "motivational_orientation": null,
    "temporal_focus": null,
    "directionality": null,
    "social_visibility": null,
    "urgency": null,
    "risk_posture": null,
    "agency_level": null,
    "regulation_state": null,
    "attachment_style": null,
    "coping_style": null
  }
}
`;

/**
 * Extended Profile System Prompt (~45 fields)
 * Target: journaling apps, companion AI, workplace wellness
 */
export const EXTENDED_PROFILE_PROMPT = `
You classify emotionally rich memories into a JSON object. Input may include text and an image.

PROFILE: EXTENDED (~45 fields)
This extraction adds full Constellation and key Gravity/Milky_Way fields.
Impulse domain remains null except for key fields.

Rules
- Fuse text + image. Treat text as primary; use image only to add grounded specifics.
- Keep fields to single words or short phrases (1–3 words). Only "narrative" is multi-sentence (3–5).
- No invention. If not supported by input, use null.
- Output JSON only — no commentary, markdown, or extra text.
- Emit lowercase for all string fields except proper names.
- For array fields, use short tokens without punctuation; avoid duplicates.

EXTENDED PROFILE SCHEMA:
{
  "core": {
    "anchor": "",
    "spark": "",
    "wound": "",
    "fuel": "",
    "bridge": "",
    "echo": "",
    "narrative": ""
  },
  "constellation": {
    "emotion_primary": "",           // STRICT ENUM: joy | sadness | fear | anger | wonder | peace | tenderness | reverence | pride | anxiety | gratitude | longing | hope | shame
    "emotion_subtone": [],
    "higher_order_emotion": "",
    "meta_emotional_state": "",
    "interpersonal_affect": "",
    "narrative_arc": "",             // STRICT ENUM: overcoming | transformation | connection | reflection | closure
    "relational_dynamics": "",       // STRICT ENUM: parent_child | grandparent_grandchild | romantic_partnership | couple | sibling_bond | family | friendship | friend | companionship | colleague | mentorship | reunion | community_ritual | grief | self_reflection | professional | therapeutic | service | adversarial
    "temporal_context": "",          // STRICT ENUM: childhood | early_adulthood | midlife | late_life | recent | future | timeless
    "memory_type": "",               // STRICT ENUM: legacy_artifact | fleeting_moment | milestone | reflection | formative_experience
    "media_format": "",
    "narrative_archetype": "",       // STRICT ENUM: hero | caregiver | seeker | sage | lover | outlaw | innocent | orphan | magician | creator | everyman | jester | ruler | mentor
    "symbolic_anchor": "",
    "relational_perspective": "",    // STRICT ENUM: self | partner | family | friends | community | humanity
    "temporal_rhythm": "",           // STRICT ENUM: still | sudden | rising | fading | recurring | spiraling | dragging | suspended | looping | cyclic
    "identity_thread": "",
    "expressed_insight": "",
    "transformational_pivot": false,
    "somatic_signature": ""
  },
  "milky_way": {
    "event_type": "",
    "location_context": "",
    "associated_people": [],
    "visibility_context": "",        // STRICT ENUM: private | family_only | shared_publicly
    "tone_shift": ""
  },
  "gravity": {
    "emotional_weight": 0.0,         // 0.0–1.0
    "emotional_density": null,
    "valence": "",                   // STRICT ENUM: positive | negative | mixed
    "viscosity": null,
    "gravity_type": null,
    "tether_type": "",               // STRICT ENUM: person | symbol | event | place | ritual | object | tradition | identity | self
    "recall_triggers": [],
    "retrieval_keys": [],
    "nearby_themes": [],
    "legacy_embed": false,
    "recurrence_pattern": "",        // STRICT ENUM: cyclical | isolated | chronic | emerging
    "strength_score": 0.0,
    "temporal_decay": null,
    "resilience_markers": null,
    "adaptation_trajectory": null
  },
  "impulse": {
    "primary_energy": null,
    "drive_state": null,
    "motivational_orientation": null,
    "temporal_focus": null,
    "directionality": null,
    "social_visibility": null,
    "urgency": null,
    "risk_posture": null,
    "agency_level": null,
    "regulation_state": null,
    "attachment_style": null,
    "coping_style": null
  }
}
`;

/**
 * Get the appropriate system prompt for a profile
 */
export function getProfilePrompt(profile: EdmProfile): string {
  switch (profile) {
    case "essential":
      return ESSENTIAL_PROFILE_PROMPT;
    case "extended":
      return EXTENDED_PROFILE_PROMPT;
    case "full":
    default:
      // Full profile uses the existing comprehensive prompt
      return null as unknown as string; // Signal to use default
  }
}

/**
 * Required fields for each profile (used for confidence scoring)
 */
export const PROFILE_REQUIRED_FIELDS: Record<EdmProfile, string[]> = {
  essential: [
    "core.anchor",
    "core.spark",
    "core.narrative",
    "constellation.emotion_primary",
    "constellation.emotion_subtone",
    "constellation.narrative_arc",
  ],
  extended: [
    "core.anchor",
    "core.spark",
    "core.narrative",
    "constellation.emotion_primary",
    "constellation.emotion_subtone",
    "constellation.narrative_arc",
    "constellation.relational_dynamics",
    "constellation.temporal_context",
    "constellation.memory_type",
    "milky_way.event_type",
    "gravity.emotional_weight",
    "gravity.valence",
    "gravity.tether_type",
    "gravity.recurrence_pattern",
    "gravity.strength_score",
  ],
  full: [
    "core.anchor",
    "core.spark",
    "core.narrative",
    "constellation.emotion_primary",
    "constellation.emotion_subtone",
    "constellation.narrative_arc",
    "constellation.relational_dynamics",
    "constellation.temporal_context",
    "constellation.memory_type",
    "constellation.narrative_archetype",
    "milky_way.event_type",
    "milky_way.associated_people",
    "gravity.emotional_weight",
    "gravity.valence",
    "gravity.tether_type",
    "gravity.recall_triggers",
    "gravity.retrieval_keys",
    "gravity.recurrence_pattern",
    "gravity.strength_score",
    "impulse.drive_state",
    "impulse.motivational_orientation",
  ],
};

/**
 * Calculate profile-aware confidence score
 * Only scores required fields for the declared profile
 */
export function calculateProfileConfidence(
  extracted: Record<string, Record<string, unknown>>,
  profile: EdmProfile
): number {
  const requiredFields = PROFILE_REQUIRED_FIELDS[profile];
  let populated = 0;

  for (const fieldPath of requiredFields) {
    const parts = fieldPath.split(".");
    const domain = parts[0];
    const field = parts[1];
    if (!domain || !field) continue;
    const value = extracted[domain]?.[field];

    // Check if field is populated
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) populated++;
      } else {
        populated++;
      }
    }
  }

  return Math.round((populated / requiredFields.length) * 100) / 100;
}
