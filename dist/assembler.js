import { extractWithLlm, createAnthropicClient } from "./extractors/llm-extractor.js";
import { extractWithOpenAI, createOpenAIClient } from "./extractors/openai-extractor.js";
import { extractWithKimi, createKimiClient, getKimiModelId } from "./extractors/kimi-extractor.js";
import { createMeta, createGovernance, createTelemetry, createSystem, createCrosswalks, detectSourceType, } from "./extractors/domain-extractors.js";
// =============================================================================
// Profile Field Definitions (EDM v0.6.0 Spec)
// =============================================================================
/**
 * Essential Profile: 5 domains, 24 fields
 * Target: memory platforms, agent frameworks, AI assistants
 */
export const ESSENTIAL_PROFILE_FIELDS = {
    meta: ["id", "version", "profile", "created_at", "owner_user_id", "consent_basis", "visibility", "pii_tier"],
    core: ["anchor", "spark", "wound", "fuel", "bridge", "echo"],
    constellation: ["emotion_primary", "emotion_subtone", "narrative_arc"],
    governance: ["jurisdiction", "retention_policy", "subject_rights"],
    telemetry: ["entry_confidence", "extraction_model"],
};
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
    meta: ["id", "version", "profile", "created_at", "owner_user_id", "consent_basis", "visibility", "pii_tier"],
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
};
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
};
/**
 * Get profile field definitions
 */
export function getProfileFields(profile) {
    switch (profile) {
        case "essential":
            return ESSENTIAL_PROFILE_FIELDS;
        case "extended":
            return EXTENDED_PROFILE_FIELDS;
        case "full":
            return FULL_PROFILE_FIELDS;
    }
}
/**
 * Get domains included in a profile
 */
export function getProfileDomains(profile) {
    return Object.keys(getProfileFields(profile));
}
// =============================================================================
// Profile Filtering
// =============================================================================
/**
 * Filter an object to include only specified fields
 */
function filterObjectFields(obj, allowedFields) {
    const filtered = {};
    for (const field of allowedFields) {
        if (field in obj) {
            filtered[field] = obj[field];
        }
    }
    return filtered;
}
/**
 * Filter nested governance fields for Essential/Extended profiles
 */
function filterGovernanceFields(governance, allowedFields) {
    const filtered = {};
    for (const field of allowedFields) {
        if (field in governance) {
            const value = governance[field];
            // For retention_policy, filter to basis, ttl_days, on_expiry only
            if (field === "retention_policy" && value && typeof value === "object") {
                const rp = value;
                filtered[field] = {
                    basis: rp.basis,
                    ttl_days: rp.ttl_days,
                    on_expiry: rp.on_expiry,
                };
            }
            // For subject_rights, filter to portable, erasable, explainable only
            else if (field === "subject_rights" && value && typeof value === "object") {
                const sr = value;
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
 * Per EDM v0.6.0 Profile Invariants: out-of-profile fields MUST be omitted entirely
 */
export function filterByProfile(artifact, profile) {
    const profileFields = getProfileFields(profile);
    const filtered = {};
    for (const [domain, fields] of Object.entries(profileFields)) {
        const domainData = artifact[domain];
        if (domainData && typeof domainData === "object") {
            if (domain === "governance") {
                filtered[domain] = filterGovernanceFields(domainData, fields);
            }
            else {
                filtered[domain] = filterObjectFields(domainData, fields);
            }
        }
    }
    return filtered;
}
/**
 * Extract a complete EDM artifact from content
 *
 * @param options - Extraction options including profile
 * @returns Profile-conformant EDM artifact
 */
export async function extractFromContent(options) {
    const { content, metadata, model, provider = "kimi", temperature, profile = "full" } = options;
    let llmResult;
    if (provider === "openai") {
        const client = createOpenAIClient();
        llmResult = await extractWithOpenAI(client, content, model, temperature, profile);
    }
    else if (provider === "kimi") {
        const client = createKimiClient();
        llmResult = await extractWithKimi(client, content, model ?? getKimiModelId(), profile);
    }
    else {
        const client = createAnthropicClient();
        llmResult = await extractWithLlm(client, content, model, profile);
    }
    // Assemble profile-specific artifact
    const artifact = assembleProfileArtifact(llmResult.extracted, metadata, {
        confidence: llmResult.confidence,
        model: llmResult.model,
        profile: llmResult.profile,
        provider,
        notes: llmResult.notes,
        hasText: !!content.text,
        hasImage: !!content.image,
    });
    return artifact;
}
/**
 * Extract from content with a provided Anthropic client
 */
export async function extractFromContentWithClient(client, options) {
    const { content, metadata, model, profile = "full" } = options;
    // Extract with LLM
    const llmResult = await extractWithLlm(client, content, model, profile);
    // Assemble profile-specific artifact
    const artifact = assembleProfileArtifact(llmResult.extracted, metadata, {
        confidence: llmResult.confidence,
        model: llmResult.model,
        profile: llmResult.profile,
        provider: 'anthropic',
        notes: llmResult.notes,
        hasText: !!content.text,
        hasImage: !!content.image,
    });
    return artifact;
}
/**
 * Assemble a profile-specific EDM artifact from extracted fields and metadata
 * Returns only the domains defined for the declared profile
 */
export function assembleProfileArtifact(extracted, metadata, context) {
    const sourceType = detectSourceType(context.hasText, context.hasImage);
    const profile = context.profile;
    const profileFields = getProfileFields(profile);
    // Create metadata domains
    const meta = createMeta(metadata, sourceType, profile);
    const governance = createGovernance(metadata);
    const telemetry = createTelemetry(context.confidence, context.model, context.notes, context.provider);
    // Build artifact with only profile-specific domains
    const artifact = {
        meta: filterObjectFields(meta, profileFields.meta ?? []),
        core: extracted.core,
        constellation: extracted.constellation,
        governance: filterGovernanceFields(governance, profileFields.governance ?? []),
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
        artifact.crosswalks = createCrosswalks(extracted);
    }
    return artifact;
}
/**
 * Assemble a complete EDM artifact from extracted fields and metadata
 * Note: Returns full artifact structure; use filterByProfile to strip out-of-profile fields
 * @deprecated Use assembleProfileArtifact for profile-aware assembly
 */
export function assembleArtifact(extracted, metadata, context) {
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
export function createEmptyArtifact() {
    return {
        meta: {
            id: null,
            version: "0.7.0",
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
//# sourceMappingURL=assembler.js.map