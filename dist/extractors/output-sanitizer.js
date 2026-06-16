/**
 * LLM output sanitation
 *
 * Runs between JSON.parse and zod validation in every extractor. Two
 * failure modes from the 2026-06-10 archive-sample run motivate it:
 *
 * - emotion_subtone with >4 items on emotionally rich threads (model
 *   enthusiasm exceeds the spec cap) — hard-failed validation/sealing.
 * - Free-text values in STRICT ENUM fields (e.g. narrative_archetype:
 *   "observer") — hard-failed validation/sealing.
 *
 * Policy: prefer a null/clamped field over a dropped artifact. Strict-enum
 * coercion to null matches the prompts' own instruction ("pick ONE or
 * null"); array caps match the JSON schema. Free-text-tolerant fields
 * (emotion_primary, narrative_arc, arc_type, relational_dynamics,
 * tether_type, recurrence_pattern, coping_style) are NOT touched.
 */
/** Fields documented as STRICT ENUM — invalid values coerce to null */
const STRICT_ENUMS = {
    constellation: {
        temporal_context: ["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"],
        memory_type: ["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"],
        media_format: ["photo", "video", "audio", "text", "photo_with_story"],
        narrative_archetype: ["hero", "caregiver", "seeker", "sage", "lover", "outlaw", "innocent", "magician", "creator", "everyman", "jester", "ruler"],
        relational_perspective: ["self", "partner", "family", "friends", "community", "humanity"],
        temporal_rhythm: ["still", "sudden", "rising", "fading", "recurring", "spiraling", "dragging", "suspended", "looping", "cyclic"],
    },
    milky_way: {
        visibility_context: ["private", "family_only", "shared_publicly"],
    },
    gravity: {
        emotional_density: ["low", "medium", "high"],
        valence: ["positive", "negative", "mixed"],
        viscosity: ["low", "medium", "high", "enduring", "fluid"],
        temporal_decay: ["fast", "moderate", "slow"],
        adaptation_trajectory: ["improving", "stable", "declining", "integrative", "emerging"],
    },
    impulse: {
        drive_state: ["explore", "approach", "avoid", "repair", "persevere", "share", "confront", "protect", "process"],
        motivational_orientation: ["belonging", "safety", "mastery", "meaning", "autonomy", "authenticity"],
        temporal_focus: ["past", "present", "future"],
        directionality: ["inward", "outward", "transcendent"],
        social_visibility: ["private", "relational", "collective"],
        urgency: ["calm", "elevated", "pressing", "acute"],
        risk_posture: ["cautious", "balanced", "bold"],
        agency_level: ["low", "medium", "high"],
        regulation_state: ["regulated", "wavering", "dysregulated"],
        attachment_style: ["secure", "anxious", "avoidant", "disorganized"],
    },
};
/** Array fields with spec caps — overflow is truncated, not rejected */
const ARRAY_CAPS = {
    constellation: { emotion_subtone: 4 },
    gravity: { resilience_markers: 3 },
};
/** Numeric fields clamped to [0, 1] */
const UNIT_INTERVAL_FIELDS = {
    gravity: ["emotional_weight", "strength_score"],
};
/**
 * Sanitize parsed LLM output in place. Returns notes describing every
 * change so callers can surface them in telemetry.
 */
const STANCE_VALUES = ["lived", "witnessed", "quoted_third_party", "assistant_generated", "hypothetical"];
export function sanitizeLlmOutput(parsed) {
    const notes = [];
    if (typeof parsed !== "object" || parsed === null)
        return notes;
    const root = parsed;
    // Normalize the top-level experiential_stance before validation:
    // "quoted third-party" -> "quoted_third_party"; anything unrecognized -> null.
    const stance = root["experiential_stance"];
    if (typeof stance === "string") {
        const normalized = stance.trim().toLowerCase().replace(/[\s-]+/g, "_");
        if (normalized !== stance) {
            root["experiential_stance"] = STANCE_VALUES.includes(normalized) ? normalized : null;
            notes.push({ path: "experiential_stance", action: STANCE_VALUES.includes(normalized) ? "clamped" : "coerced_to_null", original: stance });
        }
        else if (!STANCE_VALUES.includes(stance)) {
            root["experiential_stance"] = null;
            notes.push({ path: "experiential_stance", action: "coerced_to_null", original: stance });
        }
    }
    for (const [domain, fields] of Object.entries(STRICT_ENUMS)) {
        const d = root[domain];
        if (!d || typeof d !== "object")
            continue;
        for (const [field, allowed] of Object.entries(fields)) {
            const v = d[field];
            if (typeof v === "string" && v !== "" && !allowed.includes(v)) {
                notes.push({ path: `${domain}.${field}`, action: "coerced_to_null", original: v });
                d[field] = null;
            }
        }
    }
    for (const [domain, fields] of Object.entries(ARRAY_CAPS)) {
        const d = root[domain];
        if (!d || typeof d !== "object")
            continue;
        for (const [field, cap] of Object.entries(fields)) {
            const v = d[field];
            if (Array.isArray(v) && v.length > cap) {
                notes.push({ path: `${domain}.${field}`, action: "truncated", original: v.length });
                d[field] = v.slice(0, cap);
            }
        }
    }
    for (const [domain, fields] of Object.entries(UNIT_INTERVAL_FIELDS)) {
        const d = root[domain];
        if (!d || typeof d !== "object")
            continue;
        for (const field of fields) {
            const v = d[field];
            if (typeof v === "number" && (v < 0 || v > 1)) {
                notes.push({ path: `${domain}.${field}`, action: "clamped", original: v });
                d[field] = Math.min(1, Math.max(0, v));
            }
        }
    }
    return notes;
}
/** Render sanitation notes for telemetry.extraction_notes */
export function formatSanitationNotes(notes) {
    if (notes.length === 0)
        return null;
    return ("sanitized: " +
        notes.map((n) => `${n.path} ${n.action}${n.action === "coerced_to_null" ? ` (was ${JSON.stringify(n.original)})` : ""}`).join("; "));
}
//# sourceMappingURL=output-sanitizer.js.map