/**
 * Experiential stance — whose experience the emotionally salient material
 * is, relative to the subject. Proposed for EDM v0.9; until then it travels
 * in extraction results and telemetry notes, never in the artifact body.
 */
export const EXPERIENTIAL_STANCE = [
    "lived",
    "witnessed",
    "quoted_third_party",
    "assistant_generated",
    "hypothetical",
];
// =============================================================================
// Enum Constants (for convenience)
//
// GUARDED RESTATEMENT: these literal arrays restate the edm-spec fragment
// vocabularies (`enum` for hard enums, `x-edm-canonical` for two-tier
// free-text fields) so they keep literal-union TypeScript types — deriving
// them at runtime would collapse the types to string[]. They are asserted
// equal to the installed spec's vocabularies, both directions, by
// tests/spec-drift-guard.test.ts; any drift fails `npm test` loudly.
// =============================================================================
export const EMOTION_PRIMARY = [
    "joy",
    "sadness",
    "fear",
    "anger",
    "wonder",
    "peace",
    "tenderness",
    "reverence",
    "pride",
    "anxiety",
    "gratitude",
    "longing",
    "hope",
    "shame",
    "disappointment",
    "relief",
    "frustration",
];
export const NARRATIVE_ARC = [
    "overcoming",
    "transformation",
    "connection",
    "reflection",
    "closure",
    "loss",
    "confrontation",
];
export const RELATIONAL_DYNAMICS = [
    "parent_child",
    "grandparent_grandchild",
    "romantic_partnership",
    "couple",
    "sibling_bond",
    "family",
    "friendship",
    "friend",
    "companionship",
    "colleague",
    "mentorship",
    "reunion",
    "community_ritual",
    "grief",
    "self_reflection",
    "professional",
    "therapeutic",
    "service",
    "adversarial",
];
export const TEMPORAL_CONTEXT = [
    "childhood",
    "early_adulthood",
    "midlife",
    "late_life",
    "recent",
    "future",
    "timeless",
];
export const MEMORY_TYPE = [
    "legacy_artifact",
    "fleeting_moment",
    "milestone",
    "reflection",
    "formative_experience",
];
export const NARRATIVE_ARCHETYPE = [
    "hero",
    "caregiver",
    "seeker",
    "sage",
    "lover",
    "outlaw",
    "innocent",
    "magician",
    "creator",
    "everyman",
    "jester",
    "ruler",
];
export const DRIVE_STATE = [
    "explore",
    "approach",
    "avoid",
    "repair",
    "persevere",
    "share",
    "confront",
    "protect",
    "process",
];
export const MOTIVATIONAL_ORIENTATION = [
    "belonging",
    "safety",
    "mastery",
    "meaning",
    "autonomy",
    "authenticity",
];
//# sourceMappingURL=types.js.map