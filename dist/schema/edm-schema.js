/**
 * EDM v0.7.0 Zod Schema
 * Generated from canonical JSON schema at deepadata-edm-spec
 */
import { z } from "zod";
// =============================================================================
// META Domain
// =============================================================================
export const MetaSchema = z.object({
    id: z
        .string()
        .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
        .nullable()
        .describe("Unique identifier for the EDM artifact"),
    version: z
        .string()
        .regex(/^0\.[5-7]\.[0-9]+(-alpha)?$/)
        .describe("EDM schema version"),
    source_timestamp: z.string().nullable().optional().describe("Original source content timestamp"),
    profile: z
        .enum(["essential", "extended", "full"])
        .describe("Implementation profile (essential/extended/full)"),
    created_at: z.string().datetime().describe("Extraction timestamp"),
    updated_at: z.string().datetime().nullable().optional().describe("Post-extraction update timestamp"),
    locale: z
        .string()
        .regex(/^[a-z]{2}(-[a-z]{2})?$/)
        .nullable()
        .optional()
        .describe("Linguistic and cultural context"),
    owner_user_id: z.string().nullable().describe("Artifact owner (null in stateless mode)"),
    parent_id: z
        .string()
        .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
        .nullable()
        .optional()
        .describe("Parent artifact link"),
    visibility: z.enum(["private", "shared", "public"]).describe("Access control"),
    pii_tier: z.enum(["none", "low", "moderate", "high", "extreme"]).describe("PII classification"),
    source_type: z.enum(["text", "audio", "image", "video", "mixed"]).describe("Input medium"),
    source_context: z.string().nullable().optional().describe("Optional input scenario"),
    consent_basis: z
        .enum(["consent", "contract", "legitimate_interest", "none"])
        .describe("Legal basis for processing"),
    consent_scope: z.string().nullable().optional().describe("Scope of consent"),
    consent_revoked_at: z.string().datetime().nullable().optional().describe("Consent revocation timestamp"),
    tags: z.array(z.string()).optional().describe("User-defined labels"),
});
// =============================================================================
// CORE Domain
// =============================================================================
export const CoreSchema = z.object({
    anchor: z.string().nullable().describe("Central person, object, or theme"),
    spark: z.string().nullable().describe("What triggered the emotional response"),
    wound: z.string().nullable().describe("Emotional pain or vulnerability"),
    fuel: z.string().nullable().describe("What energized the experience"),
    bridge: z.string().nullable().describe("Connection between past and present"),
    echo: z.string().nullable().describe("What continues to resonate"),
    narrative: z.string().nullable().describe("3-5 sentence compressed account"),
});
/**
 * Essential Profile Core Schema (6 fields, no narrative)
 * Narrative synthesis belongs at Extended and above
 */
export const CoreEssentialSchema = z.object({
    anchor: z.string().nullable().describe("Central person, object, or theme"),
    spark: z.string().nullable().describe("What triggered the emotional response"),
    wound: z.string().nullable().describe("Emotional pain or vulnerability"),
    fuel: z.string().nullable().describe("What energized the experience"),
    bridge: z.string().nullable().describe("Connection between past and present"),
    echo: z.string().nullable().describe("What continues to resonate"),
});
// =============================================================================
// CONSTELLATION Domain
// =============================================================================
export const ConstellationSchema = z.object({
    emotion_primary: z
        .union([
        z.enum(["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence", "pride", "anxiety", "gratitude", "longing", "hope", "shame", "disappointment", "relief", "frustration"]),
        z.string()
    ])
        .nullable()
        .describe("Dominant emotional quality"),
    emotion_subtone: z
        .array(z.string())
        .min(0)
        .max(4)
        .describe("Secondary emotional nuances"),
    higher_order_emotion: z.string().nullable().describe("Complex emotional state"),
    meta_emotional_state: z.string().nullable().describe("How person relates to own emotions"),
    interpersonal_affect: z.string().nullable().describe("Emotional posture in relational context"),
    narrative_arc: z
        .union([
        z.enum(["overcoming", "transformation", "connection", "reflection", "closure", "loss", "confrontation"]),
        z.string()
    ])
        .nullable()
        .describe("Story trajectory"),
    relational_dynamics: z
        .union([
        z.enum([
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
        ]),
        z.string()
    ])
        .nullable()
        .describe("Dominant relational configuration"),
    temporal_context: z
        .enum(["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"])
        .nullable()
        .describe("Life-stage frame"),
    memory_type: z
        .enum(["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"])
        .nullable()
        .describe("Memory classification"),
    media_format: z
        .enum(["photo", "video", "audio", "text", "photo_with_story"])
        .nullable()
        .describe("Capture format"),
    narrative_archetype: z
        .enum([
        "hero",
        "caregiver",
        "seeker",
        "sage",
        "lover",
        "outlaw",
        "innocent",
        "orphan",
        "magician",
        "creator",
        "everyman",
        "jester",
        "ruler",
        "mentor",
    ])
        .nullable()
        .describe("Structural role in narrative"),
    symbolic_anchor: z.string().nullable().describe("Symbolic object or place"),
    relational_perspective: z
        .enum(["self", "partner", "family", "friends", "community", "humanity"])
        .nullable()
        .describe("Narrative perspective"),
    temporal_rhythm: z
        .enum([
        "still",
        "sudden",
        "rising",
        "fading",
        "recurring",
        "spiraling",
        "dragging",
        "suspended",
        "looping",
        "cyclic",
    ])
        .nullable()
        .describe("Temporal movement"),
    identity_thread: z.string().nullable().describe("Connection to personal identity"),
    expressed_insight: z.string().nullable().describe("Explicit realization stated by subject"),
    transformational_pivot: z.boolean().describe("Life-changing experience flag"),
    somatic_signature: z.string().nullable().describe("Bodily sensations described"),
    arc_type: z
        .union([
        z.enum(["betrayal", "liberation", "grief", "discovery", "resistance", "bond", "moral_awakening", "transformation", "reconciliation", "reckoning", "threshold", "exile", "gratitude", "authenticity"]),
        z.string()
    ])
        .nullable()
        .optional()
        .describe("Structural emotional arc pattern"),
});
// =============================================================================
// MILKY_WAY Domain
// =============================================================================
export const MilkyWaySchema = z.object({
    event_type: z.string().nullable().describe("Type of event"),
    location_context: z.string().nullable().describe("Place or spatial context"),
    associated_people: z.array(z.string()).describe("Individuals connected to experience"),
    visibility_context: z
        .enum(["private", "family_only", "shared_publicly"])
        .nullable()
        .describe("Sharing scope"),
    tone_shift: z.string().nullable().describe("Directional emotional change"),
});
// =============================================================================
// GRAVITY Domain
// =============================================================================
export const GravitySchema = z.object({
    emotional_weight: z.number().min(0).max(1).describe("Felt intensity (0.0-1.0)"),
    emotional_density: z.enum(["low", "medium", "high"]).nullable().describe("Emotional concentration"),
    valence: z.enum(["positive", "negative", "mixed"]).nullable().describe("Emotional direction"),
    viscosity: z
        .enum(["low", "medium", "high", "enduring", "fluid"])
        .nullable()
        .describe("Emotion persistence"),
    gravity_type: z.string().nullable().describe("Nature of emotional pull"),
    tether_type: z
        .union([
        z.enum(["person", "symbol", "event", "place", "ritual", "object", "tradition", "identity", "self"]),
        z.string()
    ])
        .nullable()
        .describe("Anchor element type"),
    recall_triggers: z.array(z.string()).describe("Sensory/symbolic cues"),
    retrieval_keys: z.array(z.string()).describe("Compact memory hooks"),
    nearby_themes: z.array(z.string()).describe("Adjacent concepts"),
    recurrence_pattern: z
        .union([
        z.enum(["cyclical", "isolated", "chronic", "emerging"]),
        z.string()
    ])
        .nullable()
        .describe("Temporal recurrence structure"),
    strength_score: z.number().min(0).max(1).describe("Binding strength (0.0-1.0)"),
    temporal_decay: z.enum(["fast", "moderate", "slow"]).nullable().describe("Intensity diminishment rate"),
    resilience_markers: z.array(z.string()).max(3).nullable().describe("Stabilizing indicators"),
    adaptation_trajectory: z
        .enum(["improving", "stable", "declining", "integrative", "emerging"])
        .nullable()
        .describe("Emotional evolution"),
});
// =============================================================================
// IMPULSE Domain
// =============================================================================
export const ImpulseSchema = z.object({
    primary_energy: z.string().nullable().describe("Dominant motivational energy"),
    drive_state: z
        .enum(["explore", "approach", "avoid", "repair", "persevere", "share", "confront", "protect", "process"])
        .nullable()
        .describe("Behavioral direction"),
    motivational_orientation: z
        .enum(["belonging", "safety", "mastery", "meaning", "autonomy", "authenticity"])
        .nullable()
        .describe("Foundational motivation"),
    temporal_focus: z.enum(["past", "present", "future"]).nullable().describe("Temporal orientation"),
    directionality: z
        .enum(["inward", "outward", "transcendent"])
        .nullable()
        .describe("Impulse direction"),
    social_visibility: z
        .enum(["private", "relational", "collective"])
        .nullable()
        .describe("Social scope"),
    urgency: z.enum(["calm", "elevated", "pressing", "acute"]).nullable().describe("Motivational intensity"),
    risk_posture: z.enum(["cautious", "balanced", "bold"]).nullable().describe("Stance toward risk"),
    agency_level: z.enum(["low", "medium", "high"]).nullable().describe("Perceived ability to act"),
    regulation_state: z
        .enum(["regulated", "wavering", "dysregulated"])
        .nullable()
        .describe("Emotional regulation stability"),
    attachment_style: z
        .enum(["secure", "anxious", "avoidant", "disorganized"])
        .nullable()
        .describe("Relational attachment pattern"),
    coping_style: z
        .union([
        z.enum(["reframe_meaning", "seek_support", "distract", "ritualize", "confront", "detach", "process"]),
        z.string()
    ])
        .nullable()
        .describe("Primary coping strategy"),
});
// =============================================================================
// GOVERNANCE Domain
// =============================================================================
export const RetentionPolicySchema = z.object({
    basis: z.enum(["user_defined", "legal", "business_need"]).nullable(),
    ttl_days: z.number().int().nonnegative().nullable(),
    on_expiry: z.enum(["soft_delete", "hard_delete", "anonymize"]).nullable(),
});
export const SubjectRightsSchema = z.object({
    portable: z.boolean().describe("Eligible for portability requests"),
    erasable: z.boolean().describe("Must be erasable on request"),
    explainable: z.boolean().describe("Must provide interpretability"),
});
export const KAnonymitySchema = z.object({
    k: z.number().int().min(1).nullable(),
    groups: z.array(z.string()),
});
export const GovernanceSchema = z.object({
    jurisdiction: z
        .enum(["GDPR", "CCPA", "HIPAA", "PIPEDA", "LGPD", "None", "Mixed"])
        .nullable()
        .describe("Regulatory regime"),
    retention_policy: RetentionPolicySchema.nullable(),
    subject_rights: SubjectRightsSchema,
    exportability: z.enum(["allowed", "restricted", "forbidden"]).describe("Export control"),
    k_anonymity: KAnonymitySchema.nullable(),
    policy_labels: z
        .array(z.enum(["sensitive", "children", "health", "biometrics", "financial", "none"]))
        .describe("Sensitive category labels"),
    masking_rules: z.array(z.string()).describe("Redaction requirements"),
});
// =============================================================================
// TELEMETRY Domain
// =============================================================================
export const TelemetrySchema = z.object({
    entry_confidence: z.number().min(0).max(1).describe("Extraction accuracy confidence"),
    extraction_model: z.string().nullable().describe("Model/engine identifier"),
    extraction_provider: z.enum(['anthropic', 'openai', 'kimi']).nullable().optional().describe("LLM provider used for extraction"),
    extraction_notes: z.string().nullable().describe("Quality notes"),
});
// =============================================================================
// SYSTEM Domain
// =============================================================================
export const EmbeddingRefSchema = z.object({
    provider: z.string(),
    sector: z.string(),
    dim: z.number().int().positive(),
    quantized: z.boolean(),
    vector_ref: z.string(),
});
export const IndicesSchema = z.object({
    waypoint_ids: z.array(z.string()),
});
export const SystemSchema = z.object({
    embeddings: z.array(EmbeddingRefSchema),
    indices: IndicesSchema,
});
// =============================================================================
// CROSSWALKS Domain
// =============================================================================
export const CrosswalksSchema = z.object({
    plutchik_primary: z.string().nullable().describe("Plutchik emotion taxonomy"),
    geneva_emotion_wheel: z.string().nullable().describe("Geneva Emotion Wheel mapping"),
    DSM5_specifiers: z.string().nullable().describe("DSM-5 specifiers"),
    ISO_27557_labels: z.string().nullable().describe("ISO emotional data classification"),
});
// =============================================================================
// Complete EDM Artifact Schema
// =============================================================================
export const EdmArtifactSchema = z.object({
    meta: MetaSchema,
    core: CoreSchema,
    constellation: ConstellationSchema,
    milky_way: MilkyWaySchema,
    gravity: GravitySchema,
    impulse: ImpulseSchema,
    governance: GovernanceSchema,
    telemetry: TelemetrySchema,
    system: SystemSchema,
    crosswalks: CrosswalksSchema,
    extensions: z.record(z.string(), z.object({}).passthrough()).optional().describe("Partner-namespaced semantic enrichments"),
});
// =============================================================================
// LLM Extraction Schemas (profile-specific)
// =============================================================================
/**
 * Essential Profile Constellation (3 fields only)
 */
export const ConstellationEssentialSchema = z.object({
    emotion_primary: z
        .union([
        z.enum(["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence", "pride", "anxiety", "gratitude", "longing", "hope", "shame", "disappointment", "relief", "frustration"]),
        z.string()
    ])
        .nullable(),
    emotion_subtone: z.array(z.string()).min(0).max(4),
    narrative_arc: z
        .union([
        z.enum(["overcoming", "transformation", "connection", "reflection", "closure", "loss", "confrontation"]),
        z.string()
    ])
        .nullable(),
});
/**
 * Extended Profile Gravity (5 fields only)
 */
export const GravityExtendedSchema = z.object({
    emotional_weight: z.number().min(0).max(1),
    valence: z.enum(["positive", "negative", "mixed"]).nullable(),
    tether_type: z
        .union([
        z.enum(["person", "symbol", "event", "place", "ritual", "object", "tradition", "identity", "self"]),
        z.string()
    ])
        .nullable(),
    recurrence_pattern: z
        .enum(["cyclical", "isolated", "chronic", "emerging"])
        .nullable(),
    strength_score: z.number().min(0).max(1),
});
/**
 * Essential Profile LLM Extraction Schema
 * Core (6 fields) + Constellation (3 fields) = 9 LLM-extracted fields
 */
export const LlmEssentialFieldsSchema = z.object({
    core: CoreEssentialSchema,
    constellation: ConstellationEssentialSchema,
});
/**
 * Extended Profile LLM Extraction Schema
 * Core (7) + Constellation (18) + Milky_Way (5) + Gravity (5) = 35 LLM-extracted fields
 * Impulse domain is NOT included in Extended profile
 */
export const LlmExtendedFieldsSchema = z.object({
    core: CoreSchema,
    constellation: ConstellationSchema,
    milky_way: MilkyWaySchema,
    gravity: GravityExtendedSchema,
});
/**
 * Full Profile LLM Extraction Schema (all LLM-extracted domains)
 */
export const LlmExtractedFieldsSchema = z.object({
    core: CoreSchema,
    constellation: ConstellationSchema,
    milky_way: MilkyWaySchema,
    gravity: GravitySchema,
    impulse: ImpulseSchema,
});
//# sourceMappingURL=edm-schema.js.map