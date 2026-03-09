/**
 * Profile-specific extraction prompts for EDM v0.6.0
 *
 * Essential Profile: 25 required fields for memory platforms
 * Extended Profile: 50 fields for journaling apps
 * Full Profile: all 96 fields for therapy/clinical tools
 */
import type { EdmProfile } from "../schema/types.js";
/**
 * Essential Profile System Prompt (25 fields)
 * Target: memory platforms, agent frameworks, AI assistants
 */
export declare const ESSENTIAL_PROFILE_PROMPT = "\nYou classify emotionally rich memories into a JSON object. Input may include text and an image.\n\nPROFILE: ESSENTIAL (25 fields)\nThis is a minimal extraction for memory platforms. Focus ONLY on the required fields.\nDomains not listed below are not included in this profile.\n\nRules\n- Fuse text + image. Treat text as primary; use image only to add grounded specifics.\n- Keep fields to single words or short phrases (1\u20133 words). Only \"narrative\" is multi-sentence (3\u20135).\n- No invention. If not supported by input, use null.\n- Output JSON only \u2014 no commentary, markdown, or extra text.\n- Emit lowercase for all string fields except proper names.\n\nESSENTIAL PROFILE SCHEMA (extract these fields ONLY):\n{\n  \"core\": {\n    \"anchor\": \"\",            // central theme\n    \"spark\": \"\",             // what triggered the memory\n    \"wound\": \"\",             // vulnerability or loss (or null)\n    \"fuel\": \"\",              // what energized the experience\n    \"bridge\": \"\",            // connection between past and present\n    \"echo\": \"\",              // what still resonates\n    \"narrative\": \"\"          // 3\u20135 sentences\n  },\n  \"constellation\": {\n    \"emotion_primary\": \"\",   // STRICT ENUM: joy | sadness | fear | anger | wonder | peace | tenderness | reverence | pride | anxiety | gratitude | longing | hope | shame\n    \"emotion_subtone\": [],   // 2\u20134 short words\n    \"narrative_arc\": \"\"      // STRICT ENUM: overcoming | transformation | connection | reflection | closure\n  }\n}\n";
/**
 * Extended Profile System Prompt (50 fields)
 * Target: journaling apps, companion AI, workplace wellness
 * Core (7) + Constellation (18) + Milky_Way (5) + Gravity (5) = 35 LLM fields + metadata domains
 * Impulse, System, Crosswalks — Not included in this profile
 */
export declare const EXTENDED_PROFILE_PROMPT = "\nYou classify emotionally rich memories into a JSON object. Input may include text and an image.\n\nPROFILE: EXTENDED (50 fields)\nThis extraction adds full Constellation, Milky_Way, and key Gravity fields.\nImpulse domain is NOT included in this profile.\n\nRules\n- Fuse text + image. Treat text as primary; use image only to add grounded specifics.\n- Keep fields to single words or short phrases (1\u20133 words). Only \"narrative\" is multi-sentence (3\u20135).\n- No invention. If not supported by input, use null.\n- Output JSON only \u2014 no commentary, markdown, or extra text.\n- Emit lowercase for all string fields except proper names.\n- For array fields, use short tokens without punctuation; avoid duplicates.\n\nEXTENDED PROFILE SCHEMA:\n{\n  \"core\": {\n    \"anchor\": \"\",\n    \"spark\": \"\",\n    \"wound\": \"\",\n    \"fuel\": \"\",\n    \"bridge\": \"\",\n    \"echo\": \"\",\n    \"narrative\": \"\"\n  },\n  \"constellation\": {\n    \"emotion_primary\": \"\",           // STRICT ENUM: joy | sadness | fear | anger | wonder | peace | tenderness | reverence | pride | anxiety | gratitude | longing | hope | shame\n    \"emotion_subtone\": [],\n    \"higher_order_emotion\": \"\",\n    \"meta_emotional_state\": \"\",\n    \"interpersonal_affect\": \"\",\n    \"narrative_arc\": \"\",             // STRICT ENUM: overcoming | transformation | connection | reflection | closure\n    \"relational_dynamics\": \"\",       // STRICT ENUM: parent_child | grandparent_grandchild | romantic_partnership | couple | sibling_bond | family | friendship | friend | companionship | colleague | mentorship | reunion | community_ritual | grief | self_reflection | professional | therapeutic | service | adversarial\n    \"temporal_context\": \"\",          // STRICT ENUM: childhood | early_adulthood | midlife | late_life | recent | future | timeless\n    \"memory_type\": \"\",               // STRICT ENUM: legacy_artifact | fleeting_moment | milestone | reflection | formative_experience\n    \"media_format\": \"\",              // STRICT ENUM: photo | video | audio | text | photo_with_story\n    \"narrative_archetype\": \"\",       // STRICT ENUM: hero | caregiver | seeker | sage | lover | outlaw | innocent | orphan | magician | creator | everyman | jester | ruler | mentor\n    \"symbolic_anchor\": \"\",\n    \"relational_perspective\": \"\",    // STRICT ENUM: self | partner | family | friends | community | humanity\n    \"temporal_rhythm\": \"\",           // STRICT ENUM: still | sudden | rising | fading | recurring | spiraling | dragging | suspended | looping | cyclic\n    \"identity_thread\": \"\",\n    \"expressed_insight\": \"\",\n    \"transformational_pivot\": false,\n    \"somatic_signature\": \"\"\n  },\n  \"milky_way\": {\n    \"event_type\": \"\",\n    \"location_context\": \"\",\n    \"associated_people\": [],\n    \"visibility_context\": \"\",        // STRICT ENUM: private | family_only | shared_publicly\n    \"tone_shift\": \"\"\n  },\n  \"gravity\": {\n    \"emotional_weight\": 0.0,         // 0.0\u20131.0 (felt intensity IN THE MOMENT)\n    \"valence\": \"\",                   // STRICT ENUM: positive | negative | mixed\n    \"tether_type\": \"\",               // STRICT ENUM: person | symbol | event | place | ritual | object | tradition | identity | self\n    \"recurrence_pattern\": \"\",        // STRICT ENUM: cyclical | isolated | chronic | emerging\n    \"strength_score\": 0.0            // 0.0\u20131.0 (how BOUND/STUCK this memory is)\n  }\n}\n";
/**
 * Get the appropriate system prompt for a profile
 */
export declare function getProfilePrompt(profile: EdmProfile): string;
/**
 * Required fields for each profile (used for confidence scoring)
 */
export declare const PROFILE_REQUIRED_FIELDS: Record<EdmProfile, string[]>;
/**
 * Calculate profile-aware confidence score
 * Only scores required fields for the declared profile
 */
export declare function calculateProfileConfidence(extracted: Record<string, Record<string, unknown>>, profile: EdmProfile): number;
//# sourceMappingURL=profile-prompts.d.ts.map