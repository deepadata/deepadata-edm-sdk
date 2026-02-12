/**
 * Domain Extractors for EDM v0.5.0
 * Populates domains not handled by LLM extraction
 */
import { randomUUID } from "crypto";
// =============================================================================
// META Domain
// =============================================================================
export function createMeta(metadata, sourceType) {
    return {
        id: randomUUID(),
        version: "0.5.0",
        created_at: new Date().toISOString(),
        updated_at: null,
        locale: metadata.locale ?? null,
        owner_user_id: metadata.subjectId ?? null,
        parent_id: metadata.parentId ?? null,
        visibility: metadata.visibility ?? "private",
        pii_tier: metadata.piiTier ?? "moderate",
        source_type: sourceType,
        source_context: null,
        consent_basis: metadata.consentBasis,
        consent_scope: null,
        consent_revoked_at: null,
        tags: metadata.tags ?? [],
    };
}
// =============================================================================
// GOVERNANCE Domain
// =============================================================================
export function createGovernance(metadata) {
    // Default subject rights based on jurisdiction
    const defaultRights = getDefaultSubjectRights(metadata.jurisdiction ?? null);
    return {
        jurisdiction: metadata.jurisdiction ?? null,
        retention_policy: {
            basis: "user_defined",
            ttl_days: null, // No automatic expiry by default
            on_expiry: "soft_delete",
        },
        subject_rights: defaultRights,
        exportability: "allowed",
        k_anonymity: {
            k: null,
            groups: [],
        },
        policy_labels: determinePolicyLabels(metadata.piiTier),
        masking_rules: [],
    };
}
function getDefaultSubjectRights(jurisdiction) {
    // GDPR and similar provide strong rights
    if (jurisdiction === "GDPR" || jurisdiction === "LGPD") {
        return {
            portable: true,
            erasable: true,
            explainable: true,
        };
    }
    // CCPA provides most rights
    if (jurisdiction === "CCPA") {
        return {
            portable: true,
            erasable: true,
            explainable: false,
        };
    }
    // HIPAA is strict on health data
    if (jurisdiction === "HIPAA") {
        return {
            portable: true,
            erasable: true,
            explainable: true,
        };
    }
    // Default: provide basic rights
    return {
        portable: true,
        erasable: true,
        explainable: false,
    };
}
function determinePolicyLabels(piiTier) {
    if (!piiTier || piiTier === "none") {
        return ["none"];
    }
    if (piiTier === "extreme" || piiTier === "high") {
        return ["sensitive"];
    }
    return [];
}
// =============================================================================
// TELEMETRY Domain
// =============================================================================
export function createTelemetry(confidence, model, notes) {
    return {
        entry_confidence: confidence,
        extraction_model: model,
        extraction_notes: notes,
        alignment_delta: null, // Populated by downstream systems
    };
}
// =============================================================================
// SYSTEM Domain
// =============================================================================
export function createSystem() {
    // System domain is populated by downstream systems (embedding, indexing)
    // SDK creates empty structure
    return {
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
    };
}
// =============================================================================
// CROSSWALKS Domain
// =============================================================================
export function createCrosswalks(extracted) {
    // Map emotion_primary to Plutchik
    const plutchikMapping = {
        joy: "joy",
        sadness: "sadness",
        fear: "fear",
        anger: "anger",
        wonder: "surprise", // Plutchik uses surprise
        peace: "trust", // Closest Plutchik equivalent
        tenderness: "trust",
        reverence: "trust",
    };
    const emotionPrimary = extracted.constellation.emotion_primary;
    const plutchikPrimary = emotionPrimary ? (plutchikMapping[emotionPrimary] ?? null) : null;
    // Map memory_type to HMD_v2
    const hmdMapping = {
        legacy_artifact: "autobiographical",
        fleeting_moment: "episodic",
        milestone: "flashbulb",
        reflection: "semantic",
        formative_experience: "autobiographical",
    };
    const memoryType = extracted.constellation.memory_type;
    const hmdType = memoryType ? (hmdMapping[memoryType] ?? null) : null;
    return {
        plutchik_primary: plutchikPrimary,
        geneva_emotion_wheel: null, // Requires more complex mapping
        DSM5_specifiers: null, // Should not be auto-populated
        HMD_v2_memory_type: hmdType,
        ISO_27557_labels: null, // Future standard
    };
}
// =============================================================================
// Source Type Detection
// =============================================================================
export function detectSourceType(hasText, hasImage) {
    if (hasText && hasImage) {
        return "mixed";
    }
    if (hasImage) {
        return "image";
    }
    return "text";
}
//# sourceMappingURL=domain-extractors.js.map