/**
 * EDM v0.4.0 Zod Schema
 * Generated from canonical JSON schema at deepadata-edm-spec
 */
import { z } from "zod";
export declare const MetaSchema: z.ZodObject<{
    id: z.ZodNullable<z.ZodString>;
    version: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locale: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    owner_user_id: z.ZodNullable<z.ZodString>;
    parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    visibility: z.ZodEnum<["private", "shared", "public"]>;
    pii_tier: z.ZodEnum<["none", "low", "moderate", "high", "extreme"]>;
    source_type: z.ZodEnum<["text", "audio", "image", "video", "mixed"]>;
    source_context: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    consent_basis: z.ZodEnum<["consent", "contract", "legitimate_interest", "none"]>;
    consent_scope: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    consent_revoked_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string | null;
    version: string;
    created_at: string;
    owner_user_id: string | null;
    visibility: "private" | "shared" | "public";
    pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
    source_type: "text" | "audio" | "image" | "video" | "mixed";
    consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
    updated_at?: string | null | undefined;
    locale?: string | null | undefined;
    parent_id?: string | null | undefined;
    source_context?: string | null | undefined;
    consent_scope?: string | null | undefined;
    consent_revoked_at?: string | null | undefined;
    tags?: string[] | undefined;
}, {
    id: string | null;
    version: string;
    created_at: string;
    owner_user_id: string | null;
    visibility: "private" | "shared" | "public";
    pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
    source_type: "text" | "audio" | "image" | "video" | "mixed";
    consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
    updated_at?: string | null | undefined;
    locale?: string | null | undefined;
    parent_id?: string | null | undefined;
    source_context?: string | null | undefined;
    consent_scope?: string | null | undefined;
    consent_revoked_at?: string | null | undefined;
    tags?: string[] | undefined;
}>;
export declare const CoreSchema: z.ZodObject<{
    anchor: z.ZodNullable<z.ZodString>;
    spark: z.ZodNullable<z.ZodString>;
    wound: z.ZodNullable<z.ZodString>;
    fuel: z.ZodNullable<z.ZodString>;
    bridge: z.ZodNullable<z.ZodString>;
    echo: z.ZodNullable<z.ZodString>;
    narrative: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    anchor: string | null;
    spark: string | null;
    wound: string | null;
    fuel: string | null;
    bridge: string | null;
    echo: string | null;
    narrative: string | null;
}, {
    anchor: string | null;
    spark: string | null;
    wound: string | null;
    fuel: string | null;
    bridge: string | null;
    echo: string | null;
    narrative: string | null;
}>;
export declare const ConstellationSchema: z.ZodObject<{
    emotion_primary: z.ZodNullable<z.ZodEnum<["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence", "pride", "anxiety", "gratitude", "longing"]>>;
    emotion_subtone: z.ZodArray<z.ZodString, "many">;
    higher_order_emotion: z.ZodNullable<z.ZodString>;
    meta_emotional_state: z.ZodNullable<z.ZodString>;
    interpersonal_affect: z.ZodNullable<z.ZodString>;
    narrative_arc: z.ZodNullable<z.ZodEnum<["overcoming", "transformation", "connection", "reflection", "closure"]>>;
    relational_dynamics: z.ZodNullable<z.ZodEnum<["parent_child", "romantic_partnership", "sibling_bond", "family", "friendship", "companionship", "mentorship", "reunion", "community_ritual", "grief", "self_reflection", "professional", "therapeutic", "service", "adversarial"]>>;
    temporal_context: z.ZodNullable<z.ZodEnum<["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"]>>;
    memory_type: z.ZodNullable<z.ZodEnum<["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"]>>;
    media_format: z.ZodNullable<z.ZodEnum<["photo", "video", "audio", "text", "photo_with_story"]>>;
    narrative_archetype: z.ZodNullable<z.ZodEnum<["hero", "caregiver", "seeker", "sage", "lover", "outlaw", "innocent", "magician", "creator", "everyman", "jester", "ruler", "mentor"]>>;
    symbolic_anchor: z.ZodNullable<z.ZodString>;
    relational_perspective: z.ZodNullable<z.ZodEnum<["self", "partner", "family", "friends", "community", "humanity"]>>;
    temporal_rhythm: z.ZodNullable<z.ZodEnum<["still", "sudden", "rising", "fading", "recurring", "spiraling", "dragging", "suspended", "looping", "cyclic"]>>;
    identity_thread: z.ZodNullable<z.ZodString>;
    expressed_insight: z.ZodNullable<z.ZodString>;
    transformational_pivot: z.ZodBoolean;
    somatic_signature: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
    emotion_subtone: string[];
    higher_order_emotion: string | null;
    meta_emotional_state: string | null;
    interpersonal_affect: string | null;
    narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
    relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
    temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
    memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
    media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
    narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
    symbolic_anchor: string | null;
    relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
    temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
    identity_thread: string | null;
    expressed_insight: string | null;
    transformational_pivot: boolean;
    somatic_signature: string | null;
}, {
    emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
    emotion_subtone: string[];
    higher_order_emotion: string | null;
    meta_emotional_state: string | null;
    interpersonal_affect: string | null;
    narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
    relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
    temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
    memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
    media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
    narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
    symbolic_anchor: string | null;
    relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
    temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
    identity_thread: string | null;
    expressed_insight: string | null;
    transformational_pivot: boolean;
    somatic_signature: string | null;
}>;
export declare const MilkyWaySchema: z.ZodObject<{
    event_type: z.ZodNullable<z.ZodString>;
    location_context: z.ZodNullable<z.ZodString>;
    associated_people: z.ZodArray<z.ZodString, "many">;
    visibility_context: z.ZodNullable<z.ZodEnum<["private", "family_only", "shared_publicly"]>>;
    tone_shift: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    event_type: string | null;
    location_context: string | null;
    associated_people: string[];
    visibility_context: "private" | "family_only" | "shared_publicly" | null;
    tone_shift: string | null;
}, {
    event_type: string | null;
    location_context: string | null;
    associated_people: string[];
    visibility_context: "private" | "family_only" | "shared_publicly" | null;
    tone_shift: string | null;
}>;
export declare const GravitySchema: z.ZodObject<{
    emotional_weight: z.ZodNumber;
    emotional_density: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
    valence: z.ZodNullable<z.ZodEnum<["positive", "negative", "mixed"]>>;
    viscosity: z.ZodNullable<z.ZodEnum<["low", "medium", "high", "enduring", "fluid"]>>;
    gravity_type: z.ZodNullable<z.ZodString>;
    tether_type: z.ZodNullable<z.ZodEnum<["person", "symbol", "event", "place", "ritual", "object", "tradition"]>>;
    recall_triggers: z.ZodArray<z.ZodString, "many">;
    retrieval_keys: z.ZodArray<z.ZodString, "many">;
    nearby_themes: z.ZodArray<z.ZodString, "many">;
    legacy_embed: z.ZodBoolean;
    recurrence_pattern: z.ZodNullable<z.ZodEnum<["cyclical", "isolated", "chronic", "emerging"]>>;
    strength_score: z.ZodNumber;
    temporal_decay: z.ZodNullable<z.ZodEnum<["fast", "moderate", "slow"]>>;
    resilience_markers: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    adaptation_trajectory: z.ZodNullable<z.ZodEnum<["improving", "stable", "declining", "integrative"]>>;
}, "strip", z.ZodTypeAny, {
    emotional_weight: number;
    emotional_density: "low" | "high" | "medium" | null;
    valence: "mixed" | "positive" | "negative" | null;
    viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
    gravity_type: string | null;
    tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
    recall_triggers: string[];
    retrieval_keys: string[];
    nearby_themes: string[];
    legacy_embed: boolean;
    recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
    strength_score: number;
    temporal_decay: "moderate" | "fast" | "slow" | null;
    resilience_markers: string[] | null;
    adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
}, {
    emotional_weight: number;
    emotional_density: "low" | "high" | "medium" | null;
    valence: "mixed" | "positive" | "negative" | null;
    viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
    gravity_type: string | null;
    tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
    recall_triggers: string[];
    retrieval_keys: string[];
    nearby_themes: string[];
    legacy_embed: boolean;
    recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
    strength_score: number;
    temporal_decay: "moderate" | "fast" | "slow" | null;
    resilience_markers: string[] | null;
    adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
}>;
export declare const ImpulseSchema: z.ZodObject<{
    primary_energy: z.ZodNullable<z.ZodString>;
    drive_state: z.ZodNullable<z.ZodEnum<["explore", "approach", "avoid", "repair", "persevere", "share", "confront", "protect", "process"]>>;
    motivational_orientation: z.ZodNullable<z.ZodEnum<["belonging", "safety", "mastery", "meaning", "autonomy"]>>;
    temporal_focus: z.ZodNullable<z.ZodEnum<["past", "present", "future"]>>;
    directionality: z.ZodNullable<z.ZodEnum<["inward", "outward", "transcendent"]>>;
    social_visibility: z.ZodNullable<z.ZodEnum<["private", "relational", "collective"]>>;
    urgency: z.ZodNullable<z.ZodEnum<["calm", "elevated", "pressing", "acute"]>>;
    risk_posture: z.ZodNullable<z.ZodEnum<["cautious", "balanced", "bold"]>>;
    agency_level: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
    regulation_state: z.ZodNullable<z.ZodEnum<["regulated", "wavering", "dysregulated"]>>;
    attachment_style: z.ZodNullable<z.ZodEnum<["secure", "anxious", "avoidant", "disorganized"]>>;
    coping_style: z.ZodNullable<z.ZodEnum<["reframe_meaning", "seek_support", "distract", "ritualize", "confront", "detach"]>>;
}, "strip", z.ZodTypeAny, {
    primary_energy: string | null;
    drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
    motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
    temporal_focus: "future" | "past" | "present" | null;
    directionality: "inward" | "outward" | "transcendent" | null;
    social_visibility: "private" | "relational" | "collective" | null;
    urgency: "calm" | "elevated" | "pressing" | "acute" | null;
    risk_posture: "cautious" | "balanced" | "bold" | null;
    agency_level: "low" | "high" | "medium" | null;
    regulation_state: "regulated" | "wavering" | "dysregulated" | null;
    attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
    coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
}, {
    primary_energy: string | null;
    drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
    motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
    temporal_focus: "future" | "past" | "present" | null;
    directionality: "inward" | "outward" | "transcendent" | null;
    social_visibility: "private" | "relational" | "collective" | null;
    urgency: "calm" | "elevated" | "pressing" | "acute" | null;
    risk_posture: "cautious" | "balanced" | "bold" | null;
    agency_level: "low" | "high" | "medium" | null;
    regulation_state: "regulated" | "wavering" | "dysregulated" | null;
    attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
    coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
}>;
export declare const RetentionPolicySchema: z.ZodObject<{
    basis: z.ZodNullable<z.ZodEnum<["user_defined", "legal", "business_need"]>>;
    ttl_days: z.ZodNullable<z.ZodNumber>;
    on_expiry: z.ZodNullable<z.ZodEnum<["soft_delete", "hard_delete", "anonymize"]>>;
}, "strip", z.ZodTypeAny, {
    basis: "user_defined" | "legal" | "business_need" | null;
    ttl_days: number | null;
    on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
}, {
    basis: "user_defined" | "legal" | "business_need" | null;
    ttl_days: number | null;
    on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
}>;
export declare const SubjectRightsSchema: z.ZodObject<{
    portable: z.ZodBoolean;
    erasable: z.ZodBoolean;
    explainable: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    portable: boolean;
    erasable: boolean;
    explainable: boolean;
}, {
    portable: boolean;
    erasable: boolean;
    explainable: boolean;
}>;
export declare const KAnonymitySchema: z.ZodObject<{
    k: z.ZodNullable<z.ZodNumber>;
    groups: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    k: number | null;
    groups: string[];
}, {
    k: number | null;
    groups: string[];
}>;
export declare const GovernanceSchema: z.ZodObject<{
    jurisdiction: z.ZodNullable<z.ZodEnum<["GDPR", "CCPA", "HIPAA", "PIPEDA", "LGPD", "None", "Mixed"]>>;
    retention_policy: z.ZodNullable<z.ZodObject<{
        basis: z.ZodNullable<z.ZodEnum<["user_defined", "legal", "business_need"]>>;
        ttl_days: z.ZodNullable<z.ZodNumber>;
        on_expiry: z.ZodNullable<z.ZodEnum<["soft_delete", "hard_delete", "anonymize"]>>;
    }, "strip", z.ZodTypeAny, {
        basis: "user_defined" | "legal" | "business_need" | null;
        ttl_days: number | null;
        on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
    }, {
        basis: "user_defined" | "legal" | "business_need" | null;
        ttl_days: number | null;
        on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
    }>>;
    subject_rights: z.ZodObject<{
        portable: z.ZodBoolean;
        erasable: z.ZodBoolean;
        explainable: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        portable: boolean;
        erasable: boolean;
        explainable: boolean;
    }, {
        portable: boolean;
        erasable: boolean;
        explainable: boolean;
    }>;
    exportability: z.ZodEnum<["allowed", "restricted", "forbidden"]>;
    k_anonymity: z.ZodNullable<z.ZodObject<{
        k: z.ZodNullable<z.ZodNumber>;
        groups: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        k: number | null;
        groups: string[];
    }, {
        k: number | null;
        groups: string[];
    }>>;
    policy_labels: z.ZodArray<z.ZodEnum<["sensitive", "children", "health", "biometrics", "financial", "none"]>, "many">;
    masking_rules: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
    retention_policy: {
        basis: "user_defined" | "legal" | "business_need" | null;
        ttl_days: number | null;
        on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
    } | null;
    subject_rights: {
        portable: boolean;
        erasable: boolean;
        explainable: boolean;
    };
    exportability: "allowed" | "restricted" | "forbidden";
    k_anonymity: {
        k: number | null;
        groups: string[];
    } | null;
    policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
    masking_rules: string[];
}, {
    jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
    retention_policy: {
        basis: "user_defined" | "legal" | "business_need" | null;
        ttl_days: number | null;
        on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
    } | null;
    subject_rights: {
        portable: boolean;
        erasable: boolean;
        explainable: boolean;
    };
    exportability: "allowed" | "restricted" | "forbidden";
    k_anonymity: {
        k: number | null;
        groups: string[];
    } | null;
    policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
    masking_rules: string[];
}>;
export declare const TelemetrySchema: z.ZodObject<{
    entry_confidence: z.ZodNumber;
    extraction_model: z.ZodNullable<z.ZodString>;
    extraction_notes: z.ZodNullable<z.ZodString>;
    alignment_delta: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    entry_confidence: number;
    extraction_model: string | null;
    extraction_notes: string | null;
    alignment_delta: number | null;
}, {
    entry_confidence: number;
    extraction_model: string | null;
    extraction_notes: string | null;
    alignment_delta: number | null;
}>;
export declare const EmbeddingRefSchema: z.ZodObject<{
    provider: z.ZodString;
    sector: z.ZodString;
    dim: z.ZodNumber;
    quantized: z.ZodBoolean;
    vector_ref: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: string;
    sector: string;
    dim: number;
    quantized: boolean;
    vector_ref: string;
}, {
    provider: string;
    sector: string;
    dim: number;
    quantized: boolean;
    vector_ref: string;
}>;
export declare const SectorWeightsSchema: z.ZodObject<{
    episodic: z.ZodNumber;
    semantic: z.ZodNumber;
    procedural: z.ZodNumber;
    emotional: z.ZodNumber;
    reflective: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    episodic: number;
    semantic: number;
    procedural: number;
    emotional: number;
    reflective: number;
}, {
    episodic: number;
    semantic: number;
    procedural: number;
    emotional: number;
    reflective: number;
}>;
export declare const IndicesSchema: z.ZodObject<{
    waypoint_ids: z.ZodArray<z.ZodString, "many">;
    sector_weights: z.ZodObject<{
        episodic: z.ZodNumber;
        semantic: z.ZodNumber;
        procedural: z.ZodNumber;
        emotional: z.ZodNumber;
        reflective: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        episodic: number;
        semantic: number;
        procedural: number;
        emotional: number;
        reflective: number;
    }, {
        episodic: number;
        semantic: number;
        procedural: number;
        emotional: number;
        reflective: number;
    }>;
}, "strip", z.ZodTypeAny, {
    waypoint_ids: string[];
    sector_weights: {
        episodic: number;
        semantic: number;
        procedural: number;
        emotional: number;
        reflective: number;
    };
}, {
    waypoint_ids: string[];
    sector_weights: {
        episodic: number;
        semantic: number;
        procedural: number;
        emotional: number;
        reflective: number;
    };
}>;
export declare const SystemSchema: z.ZodObject<{
    embeddings: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        sector: z.ZodString;
        dim: z.ZodNumber;
        quantized: z.ZodBoolean;
        vector_ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        sector: string;
        dim: number;
        quantized: boolean;
        vector_ref: string;
    }, {
        provider: string;
        sector: string;
        dim: number;
        quantized: boolean;
        vector_ref: string;
    }>, "many">;
    indices: z.ZodObject<{
        waypoint_ids: z.ZodArray<z.ZodString, "many">;
        sector_weights: z.ZodObject<{
            episodic: z.ZodNumber;
            semantic: z.ZodNumber;
            procedural: z.ZodNumber;
            emotional: z.ZodNumber;
            reflective: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        }, {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        waypoint_ids: string[];
        sector_weights: {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        };
    }, {
        waypoint_ids: string[];
        sector_weights: {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    embeddings: {
        provider: string;
        sector: string;
        dim: number;
        quantized: boolean;
        vector_ref: string;
    }[];
    indices: {
        waypoint_ids: string[];
        sector_weights: {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        };
    };
}, {
    embeddings: {
        provider: string;
        sector: string;
        dim: number;
        quantized: boolean;
        vector_ref: string;
    }[];
    indices: {
        waypoint_ids: string[];
        sector_weights: {
            episodic: number;
            semantic: number;
            procedural: number;
            emotional: number;
            reflective: number;
        };
    };
}>;
export declare const CrosswalksSchema: z.ZodObject<{
    plutchik_primary: z.ZodNullable<z.ZodString>;
    geneva_emotion_wheel: z.ZodNullable<z.ZodString>;
    DSM5_specifiers: z.ZodNullable<z.ZodString>;
    HMD_v2_memory_type: z.ZodNullable<z.ZodString>;
    ISO_27557_labels: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    plutchik_primary: string | null;
    geneva_emotion_wheel: string | null;
    DSM5_specifiers: string | null;
    HMD_v2_memory_type: string | null;
    ISO_27557_labels: string | null;
}, {
    plutchik_primary: string | null;
    geneva_emotion_wheel: string | null;
    DSM5_specifiers: string | null;
    HMD_v2_memory_type: string | null;
    ISO_27557_labels: string | null;
}>;
export declare const EdmArtifactSchema: z.ZodObject<{
    meta: z.ZodObject<{
        id: z.ZodNullable<z.ZodString>;
        version: z.ZodString;
        created_at: z.ZodString;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        locale: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        owner_user_id: z.ZodNullable<z.ZodString>;
        parent_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        visibility: z.ZodEnum<["private", "shared", "public"]>;
        pii_tier: z.ZodEnum<["none", "low", "moderate", "high", "extreme"]>;
        source_type: z.ZodEnum<["text", "audio", "image", "video", "mixed"]>;
        source_context: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        consent_basis: z.ZodEnum<["consent", "contract", "legitimate_interest", "none"]>;
        consent_scope: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        consent_revoked_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string | null;
        version: string;
        created_at: string;
        owner_user_id: string | null;
        visibility: "private" | "shared" | "public";
        pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
        source_type: "text" | "audio" | "image" | "video" | "mixed";
        consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
        updated_at?: string | null | undefined;
        locale?: string | null | undefined;
        parent_id?: string | null | undefined;
        source_context?: string | null | undefined;
        consent_scope?: string | null | undefined;
        consent_revoked_at?: string | null | undefined;
        tags?: string[] | undefined;
    }, {
        id: string | null;
        version: string;
        created_at: string;
        owner_user_id: string | null;
        visibility: "private" | "shared" | "public";
        pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
        source_type: "text" | "audio" | "image" | "video" | "mixed";
        consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
        updated_at?: string | null | undefined;
        locale?: string | null | undefined;
        parent_id?: string | null | undefined;
        source_context?: string | null | undefined;
        consent_scope?: string | null | undefined;
        consent_revoked_at?: string | null | undefined;
        tags?: string[] | undefined;
    }>;
    core: z.ZodObject<{
        anchor: z.ZodNullable<z.ZodString>;
        spark: z.ZodNullable<z.ZodString>;
        wound: z.ZodNullable<z.ZodString>;
        fuel: z.ZodNullable<z.ZodString>;
        bridge: z.ZodNullable<z.ZodString>;
        echo: z.ZodNullable<z.ZodString>;
        narrative: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    }, {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    }>;
    constellation: z.ZodObject<{
        emotion_primary: z.ZodNullable<z.ZodEnum<["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence", "pride", "anxiety", "gratitude", "longing"]>>;
        emotion_subtone: z.ZodArray<z.ZodString, "many">;
        higher_order_emotion: z.ZodNullable<z.ZodString>;
        meta_emotional_state: z.ZodNullable<z.ZodString>;
        interpersonal_affect: z.ZodNullable<z.ZodString>;
        narrative_arc: z.ZodNullable<z.ZodEnum<["overcoming", "transformation", "connection", "reflection", "closure"]>>;
        relational_dynamics: z.ZodNullable<z.ZodEnum<["parent_child", "romantic_partnership", "sibling_bond", "family", "friendship", "companionship", "mentorship", "reunion", "community_ritual", "grief", "self_reflection", "professional", "therapeutic", "service", "adversarial"]>>;
        temporal_context: z.ZodNullable<z.ZodEnum<["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"]>>;
        memory_type: z.ZodNullable<z.ZodEnum<["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"]>>;
        media_format: z.ZodNullable<z.ZodEnum<["photo", "video", "audio", "text", "photo_with_story"]>>;
        narrative_archetype: z.ZodNullable<z.ZodEnum<["hero", "caregiver", "seeker", "sage", "lover", "outlaw", "innocent", "magician", "creator", "everyman", "jester", "ruler", "mentor"]>>;
        symbolic_anchor: z.ZodNullable<z.ZodString>;
        relational_perspective: z.ZodNullable<z.ZodEnum<["self", "partner", "family", "friends", "community", "humanity"]>>;
        temporal_rhythm: z.ZodNullable<z.ZodEnum<["still", "sudden", "rising", "fading", "recurring", "spiraling", "dragging", "suspended", "looping", "cyclic"]>>;
        identity_thread: z.ZodNullable<z.ZodString>;
        expressed_insight: z.ZodNullable<z.ZodString>;
        transformational_pivot: z.ZodBoolean;
        somatic_signature: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    }, {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    }>;
    milky_way: z.ZodObject<{
        event_type: z.ZodNullable<z.ZodString>;
        location_context: z.ZodNullable<z.ZodString>;
        associated_people: z.ZodArray<z.ZodString, "many">;
        visibility_context: z.ZodNullable<z.ZodEnum<["private", "family_only", "shared_publicly"]>>;
        tone_shift: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    }, {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    }>;
    gravity: z.ZodObject<{
        emotional_weight: z.ZodNumber;
        emotional_density: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
        valence: z.ZodNullable<z.ZodEnum<["positive", "negative", "mixed"]>>;
        viscosity: z.ZodNullable<z.ZodEnum<["low", "medium", "high", "enduring", "fluid"]>>;
        gravity_type: z.ZodNullable<z.ZodString>;
        tether_type: z.ZodNullable<z.ZodEnum<["person", "symbol", "event", "place", "ritual", "object", "tradition"]>>;
        recall_triggers: z.ZodArray<z.ZodString, "many">;
        retrieval_keys: z.ZodArray<z.ZodString, "many">;
        nearby_themes: z.ZodArray<z.ZodString, "many">;
        legacy_embed: z.ZodBoolean;
        recurrence_pattern: z.ZodNullable<z.ZodEnum<["cyclical", "isolated", "chronic", "emerging"]>>;
        strength_score: z.ZodNumber;
        temporal_decay: z.ZodNullable<z.ZodEnum<["fast", "moderate", "slow"]>>;
        resilience_markers: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
        adaptation_trajectory: z.ZodNullable<z.ZodEnum<["improving", "stable", "declining", "integrative"]>>;
    }, "strip", z.ZodTypeAny, {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    }, {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    }>;
    impulse: z.ZodObject<{
        primary_energy: z.ZodNullable<z.ZodString>;
        drive_state: z.ZodNullable<z.ZodEnum<["explore", "approach", "avoid", "repair", "persevere", "share", "confront", "protect", "process"]>>;
        motivational_orientation: z.ZodNullable<z.ZodEnum<["belonging", "safety", "mastery", "meaning", "autonomy"]>>;
        temporal_focus: z.ZodNullable<z.ZodEnum<["past", "present", "future"]>>;
        directionality: z.ZodNullable<z.ZodEnum<["inward", "outward", "transcendent"]>>;
        social_visibility: z.ZodNullable<z.ZodEnum<["private", "relational", "collective"]>>;
        urgency: z.ZodNullable<z.ZodEnum<["calm", "elevated", "pressing", "acute"]>>;
        risk_posture: z.ZodNullable<z.ZodEnum<["cautious", "balanced", "bold"]>>;
        agency_level: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
        regulation_state: z.ZodNullable<z.ZodEnum<["regulated", "wavering", "dysregulated"]>>;
        attachment_style: z.ZodNullable<z.ZodEnum<["secure", "anxious", "avoidant", "disorganized"]>>;
        coping_style: z.ZodNullable<z.ZodEnum<["reframe_meaning", "seek_support", "distract", "ritualize", "confront", "detach"]>>;
    }, "strip", z.ZodTypeAny, {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    }, {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    }>;
    governance: z.ZodObject<{
        jurisdiction: z.ZodNullable<z.ZodEnum<["GDPR", "CCPA", "HIPAA", "PIPEDA", "LGPD", "None", "Mixed"]>>;
        retention_policy: z.ZodNullable<z.ZodObject<{
            basis: z.ZodNullable<z.ZodEnum<["user_defined", "legal", "business_need"]>>;
            ttl_days: z.ZodNullable<z.ZodNumber>;
            on_expiry: z.ZodNullable<z.ZodEnum<["soft_delete", "hard_delete", "anonymize"]>>;
        }, "strip", z.ZodTypeAny, {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        }, {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        }>>;
        subject_rights: z.ZodObject<{
            portable: z.ZodBoolean;
            erasable: z.ZodBoolean;
            explainable: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        }, {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        }>;
        exportability: z.ZodEnum<["allowed", "restricted", "forbidden"]>;
        k_anonymity: z.ZodNullable<z.ZodObject<{
            k: z.ZodNullable<z.ZodNumber>;
            groups: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            k: number | null;
            groups: string[];
        }, {
            k: number | null;
            groups: string[];
        }>>;
        policy_labels: z.ZodArray<z.ZodEnum<["sensitive", "children", "health", "biometrics", "financial", "none"]>, "many">;
        masking_rules: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
        retention_policy: {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        } | null;
        subject_rights: {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        };
        exportability: "allowed" | "restricted" | "forbidden";
        k_anonymity: {
            k: number | null;
            groups: string[];
        } | null;
        policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
        masking_rules: string[];
    }, {
        jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
        retention_policy: {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        } | null;
        subject_rights: {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        };
        exportability: "allowed" | "restricted" | "forbidden";
        k_anonymity: {
            k: number | null;
            groups: string[];
        } | null;
        policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
        masking_rules: string[];
    }>;
    telemetry: z.ZodObject<{
        entry_confidence: z.ZodNumber;
        extraction_model: z.ZodNullable<z.ZodString>;
        extraction_notes: z.ZodNullable<z.ZodString>;
        alignment_delta: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        entry_confidence: number;
        extraction_model: string | null;
        extraction_notes: string | null;
        alignment_delta: number | null;
    }, {
        entry_confidence: number;
        extraction_model: string | null;
        extraction_notes: string | null;
        alignment_delta: number | null;
    }>;
    system: z.ZodObject<{
        embeddings: z.ZodArray<z.ZodObject<{
            provider: z.ZodString;
            sector: z.ZodString;
            dim: z.ZodNumber;
            quantized: z.ZodBoolean;
            vector_ref: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }, {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }>, "many">;
        indices: z.ZodObject<{
            waypoint_ids: z.ZodArray<z.ZodString, "many">;
            sector_weights: z.ZodObject<{
                episodic: z.ZodNumber;
                semantic: z.ZodNumber;
                procedural: z.ZodNumber;
                emotional: z.ZodNumber;
                reflective: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            }, {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        }, {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        embeddings: {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }[];
        indices: {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        };
    }, {
        embeddings: {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }[];
        indices: {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        };
    }>;
    crosswalks: z.ZodObject<{
        plutchik_primary: z.ZodNullable<z.ZodString>;
        geneva_emotion_wheel: z.ZodNullable<z.ZodString>;
        DSM5_specifiers: z.ZodNullable<z.ZodString>;
        HMD_v2_memory_type: z.ZodNullable<z.ZodString>;
        ISO_27557_labels: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        plutchik_primary: string | null;
        geneva_emotion_wheel: string | null;
        DSM5_specifiers: string | null;
        HMD_v2_memory_type: string | null;
        ISO_27557_labels: string | null;
    }, {
        plutchik_primary: string | null;
        geneva_emotion_wheel: string | null;
        DSM5_specifiers: string | null;
        HMD_v2_memory_type: string | null;
        ISO_27557_labels: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    meta: {
        id: string | null;
        version: string;
        created_at: string;
        owner_user_id: string | null;
        visibility: "private" | "shared" | "public";
        pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
        source_type: "text" | "audio" | "image" | "video" | "mixed";
        consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
        updated_at?: string | null | undefined;
        locale?: string | null | undefined;
        parent_id?: string | null | undefined;
        source_context?: string | null | undefined;
        consent_scope?: string | null | undefined;
        consent_revoked_at?: string | null | undefined;
        tags?: string[] | undefined;
    };
    core: {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    };
    constellation: {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    };
    milky_way: {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    };
    gravity: {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    };
    impulse: {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    };
    governance: {
        jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
        retention_policy: {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        } | null;
        subject_rights: {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        };
        exportability: "allowed" | "restricted" | "forbidden";
        k_anonymity: {
            k: number | null;
            groups: string[];
        } | null;
        policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
        masking_rules: string[];
    };
    telemetry: {
        entry_confidence: number;
        extraction_model: string | null;
        extraction_notes: string | null;
        alignment_delta: number | null;
    };
    system: {
        embeddings: {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }[];
        indices: {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        };
    };
    crosswalks: {
        plutchik_primary: string | null;
        geneva_emotion_wheel: string | null;
        DSM5_specifiers: string | null;
        HMD_v2_memory_type: string | null;
        ISO_27557_labels: string | null;
    };
}, {
    meta: {
        id: string | null;
        version: string;
        created_at: string;
        owner_user_id: string | null;
        visibility: "private" | "shared" | "public";
        pii_tier: "none" | "low" | "moderate" | "high" | "extreme";
        source_type: "text" | "audio" | "image" | "video" | "mixed";
        consent_basis: "none" | "consent" | "contract" | "legitimate_interest";
        updated_at?: string | null | undefined;
        locale?: string | null | undefined;
        parent_id?: string | null | undefined;
        source_context?: string | null | undefined;
        consent_scope?: string | null | undefined;
        consent_revoked_at?: string | null | undefined;
        tags?: string[] | undefined;
    };
    core: {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    };
    constellation: {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    };
    milky_way: {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    };
    gravity: {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    };
    impulse: {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    };
    governance: {
        jurisdiction: "GDPR" | "CCPA" | "HIPAA" | "PIPEDA" | "LGPD" | "None" | "Mixed" | null;
        retention_policy: {
            basis: "user_defined" | "legal" | "business_need" | null;
            ttl_days: number | null;
            on_expiry: "soft_delete" | "hard_delete" | "anonymize" | null;
        } | null;
        subject_rights: {
            portable: boolean;
            erasable: boolean;
            explainable: boolean;
        };
        exportability: "allowed" | "restricted" | "forbidden";
        k_anonymity: {
            k: number | null;
            groups: string[];
        } | null;
        policy_labels: ("none" | "sensitive" | "children" | "health" | "biometrics" | "financial")[];
        masking_rules: string[];
    };
    telemetry: {
        entry_confidence: number;
        extraction_model: string | null;
        extraction_notes: string | null;
        alignment_delta: number | null;
    };
    system: {
        embeddings: {
            provider: string;
            sector: string;
            dim: number;
            quantized: boolean;
            vector_ref: string;
        }[];
        indices: {
            waypoint_ids: string[];
            sector_weights: {
                episodic: number;
                semantic: number;
                procedural: number;
                emotional: number;
                reflective: number;
            };
        };
    };
    crosswalks: {
        plutchik_primary: string | null;
        geneva_emotion_wheel: string | null;
        DSM5_specifiers: string | null;
        HMD_v2_memory_type: string | null;
        ISO_27557_labels: string | null;
    };
}>;
export declare const LlmExtractedFieldsSchema: z.ZodObject<{
    core: z.ZodObject<{
        anchor: z.ZodNullable<z.ZodString>;
        spark: z.ZodNullable<z.ZodString>;
        wound: z.ZodNullable<z.ZodString>;
        fuel: z.ZodNullable<z.ZodString>;
        bridge: z.ZodNullable<z.ZodString>;
        echo: z.ZodNullable<z.ZodString>;
        narrative: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    }, {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    }>;
    constellation: z.ZodObject<{
        emotion_primary: z.ZodNullable<z.ZodEnum<["joy", "sadness", "fear", "anger", "wonder", "peace", "tenderness", "reverence", "pride", "anxiety", "gratitude", "longing"]>>;
        emotion_subtone: z.ZodArray<z.ZodString, "many">;
        higher_order_emotion: z.ZodNullable<z.ZodString>;
        meta_emotional_state: z.ZodNullable<z.ZodString>;
        interpersonal_affect: z.ZodNullable<z.ZodString>;
        narrative_arc: z.ZodNullable<z.ZodEnum<["overcoming", "transformation", "connection", "reflection", "closure"]>>;
        relational_dynamics: z.ZodNullable<z.ZodEnum<["parent_child", "romantic_partnership", "sibling_bond", "family", "friendship", "companionship", "mentorship", "reunion", "community_ritual", "grief", "self_reflection", "professional", "therapeutic", "service", "adversarial"]>>;
        temporal_context: z.ZodNullable<z.ZodEnum<["childhood", "early_adulthood", "midlife", "late_life", "recent", "future", "timeless"]>>;
        memory_type: z.ZodNullable<z.ZodEnum<["legacy_artifact", "fleeting_moment", "milestone", "reflection", "formative_experience"]>>;
        media_format: z.ZodNullable<z.ZodEnum<["photo", "video", "audio", "text", "photo_with_story"]>>;
        narrative_archetype: z.ZodNullable<z.ZodEnum<["hero", "caregiver", "seeker", "sage", "lover", "outlaw", "innocent", "magician", "creator", "everyman", "jester", "ruler", "mentor"]>>;
        symbolic_anchor: z.ZodNullable<z.ZodString>;
        relational_perspective: z.ZodNullable<z.ZodEnum<["self", "partner", "family", "friends", "community", "humanity"]>>;
        temporal_rhythm: z.ZodNullable<z.ZodEnum<["still", "sudden", "rising", "fading", "recurring", "spiraling", "dragging", "suspended", "looping", "cyclic"]>>;
        identity_thread: z.ZodNullable<z.ZodString>;
        expressed_insight: z.ZodNullable<z.ZodString>;
        transformational_pivot: z.ZodBoolean;
        somatic_signature: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    }, {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    }>;
    milky_way: z.ZodObject<{
        event_type: z.ZodNullable<z.ZodString>;
        location_context: z.ZodNullable<z.ZodString>;
        associated_people: z.ZodArray<z.ZodString, "many">;
        visibility_context: z.ZodNullable<z.ZodEnum<["private", "family_only", "shared_publicly"]>>;
        tone_shift: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    }, {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    }>;
    gravity: z.ZodObject<{
        emotional_weight: z.ZodNumber;
        emotional_density: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
        valence: z.ZodNullable<z.ZodEnum<["positive", "negative", "mixed"]>>;
        viscosity: z.ZodNullable<z.ZodEnum<["low", "medium", "high", "enduring", "fluid"]>>;
        gravity_type: z.ZodNullable<z.ZodString>;
        tether_type: z.ZodNullable<z.ZodEnum<["person", "symbol", "event", "place", "ritual", "object", "tradition"]>>;
        recall_triggers: z.ZodArray<z.ZodString, "many">;
        retrieval_keys: z.ZodArray<z.ZodString, "many">;
        nearby_themes: z.ZodArray<z.ZodString, "many">;
        legacy_embed: z.ZodBoolean;
        recurrence_pattern: z.ZodNullable<z.ZodEnum<["cyclical", "isolated", "chronic", "emerging"]>>;
        strength_score: z.ZodNumber;
        temporal_decay: z.ZodNullable<z.ZodEnum<["fast", "moderate", "slow"]>>;
        resilience_markers: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
        adaptation_trajectory: z.ZodNullable<z.ZodEnum<["improving", "stable", "declining", "integrative"]>>;
    }, "strip", z.ZodTypeAny, {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    }, {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    }>;
    impulse: z.ZodObject<{
        primary_energy: z.ZodNullable<z.ZodString>;
        drive_state: z.ZodNullable<z.ZodEnum<["explore", "approach", "avoid", "repair", "persevere", "share", "confront", "protect", "process"]>>;
        motivational_orientation: z.ZodNullable<z.ZodEnum<["belonging", "safety", "mastery", "meaning", "autonomy"]>>;
        temporal_focus: z.ZodNullable<z.ZodEnum<["past", "present", "future"]>>;
        directionality: z.ZodNullable<z.ZodEnum<["inward", "outward", "transcendent"]>>;
        social_visibility: z.ZodNullable<z.ZodEnum<["private", "relational", "collective"]>>;
        urgency: z.ZodNullable<z.ZodEnum<["calm", "elevated", "pressing", "acute"]>>;
        risk_posture: z.ZodNullable<z.ZodEnum<["cautious", "balanced", "bold"]>>;
        agency_level: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
        regulation_state: z.ZodNullable<z.ZodEnum<["regulated", "wavering", "dysregulated"]>>;
        attachment_style: z.ZodNullable<z.ZodEnum<["secure", "anxious", "avoidant", "disorganized"]>>;
        coping_style: z.ZodNullable<z.ZodEnum<["reframe_meaning", "seek_support", "distract", "ritualize", "confront", "detach"]>>;
    }, "strip", z.ZodTypeAny, {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    }, {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    }>;
}, "strip", z.ZodTypeAny, {
    core: {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    };
    constellation: {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    };
    milky_way: {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    };
    gravity: {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    };
    impulse: {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    };
}, {
    core: {
        anchor: string | null;
        spark: string | null;
        wound: string | null;
        fuel: string | null;
        bridge: string | null;
        echo: string | null;
        narrative: string | null;
    };
    constellation: {
        emotion_primary: "joy" | "sadness" | "fear" | "anger" | "wonder" | "peace" | "tenderness" | "reverence" | "pride" | "anxiety" | "gratitude" | "longing" | null;
        emotion_subtone: string[];
        higher_order_emotion: string | null;
        meta_emotional_state: string | null;
        interpersonal_affect: string | null;
        narrative_arc: "overcoming" | "transformation" | "connection" | "reflection" | "closure" | null;
        relational_dynamics: "parent_child" | "romantic_partnership" | "sibling_bond" | "family" | "friendship" | "companionship" | "mentorship" | "reunion" | "community_ritual" | "grief" | "self_reflection" | "professional" | "therapeutic" | "service" | "adversarial" | null;
        temporal_context: "childhood" | "early_adulthood" | "midlife" | "late_life" | "recent" | "future" | "timeless" | null;
        memory_type: "reflection" | "legacy_artifact" | "fleeting_moment" | "milestone" | "formative_experience" | null;
        media_format: "text" | "audio" | "video" | "photo" | "photo_with_story" | null;
        narrative_archetype: "hero" | "caregiver" | "seeker" | "sage" | "lover" | "outlaw" | "innocent" | "magician" | "creator" | "everyman" | "jester" | "ruler" | "mentor" | null;
        symbolic_anchor: string | null;
        relational_perspective: "family" | "self" | "partner" | "friends" | "community" | "humanity" | null;
        temporal_rhythm: "still" | "sudden" | "rising" | "fading" | "recurring" | "spiraling" | "dragging" | "suspended" | "looping" | "cyclic" | null;
        identity_thread: string | null;
        expressed_insight: string | null;
        transformational_pivot: boolean;
        somatic_signature: string | null;
    };
    milky_way: {
        event_type: string | null;
        location_context: string | null;
        associated_people: string[];
        visibility_context: "private" | "family_only" | "shared_publicly" | null;
        tone_shift: string | null;
    };
    gravity: {
        emotional_weight: number;
        emotional_density: "low" | "high" | "medium" | null;
        valence: "mixed" | "positive" | "negative" | null;
        viscosity: "low" | "high" | "medium" | "enduring" | "fluid" | null;
        gravity_type: string | null;
        tether_type: "symbol" | "object" | "person" | "event" | "place" | "ritual" | "tradition" | null;
        recall_triggers: string[];
        retrieval_keys: string[];
        nearby_themes: string[];
        legacy_embed: boolean;
        recurrence_pattern: "cyclical" | "isolated" | "chronic" | "emerging" | null;
        strength_score: number;
        temporal_decay: "moderate" | "fast" | "slow" | null;
        resilience_markers: string[] | null;
        adaptation_trajectory: "improving" | "stable" | "declining" | "integrative" | null;
    };
    impulse: {
        primary_energy: string | null;
        drive_state: "explore" | "approach" | "avoid" | "repair" | "persevere" | "share" | "confront" | "protect" | "process" | null;
        motivational_orientation: "belonging" | "safety" | "mastery" | "meaning" | "autonomy" | null;
        temporal_focus: "future" | "past" | "present" | null;
        directionality: "inward" | "outward" | "transcendent" | null;
        social_visibility: "private" | "relational" | "collective" | null;
        urgency: "calm" | "elevated" | "pressing" | "acute" | null;
        risk_posture: "cautious" | "balanced" | "bold" | null;
        agency_level: "low" | "high" | "medium" | null;
        regulation_state: "regulated" | "wavering" | "dysregulated" | null;
        attachment_style: "secure" | "anxious" | "avoidant" | "disorganized" | null;
        coping_style: "confront" | "reframe_meaning" | "seek_support" | "distract" | "ritualize" | "detach" | null;
    };
}>;
//# sourceMappingURL=edm-schema.d.ts.map