import { EdmArtifactSchema } from "./schema/edm-schema.js";
import { getProfileFields, } from "./assembler.js";
/**
 * Validate that an artifact conforms to its declared profile
 * Per EDM v0.6.0 Profile Invariants:
 * - Artifact MUST contain only domains defined for declared profile
 * - Artifact MUST contain only fields defined for declared profile
 * - Out-of-profile domains/fields MUST be omitted entirely
 */
export function validateProfileConformance(artifact) {
    const errors = [];
    if (!artifact || typeof artifact !== "object") {
        return {
            conformant: false,
            profile: "full",
            errors: [{ type: "missing_domain", domain: "meta", message: "Artifact is not an object" }],
            domainCount: 0,
            fieldCount: 0,
        };
    }
    const obj = artifact;
    // Get declared profile from meta.profile
    const meta = obj.meta;
    const declaredProfile = meta?.profile ?? "full";
    if (!["essential", "extended", "full"].includes(declaredProfile)) {
        return {
            conformant: false,
            profile: declaredProfile,
            errors: [{
                    type: "extra_field",
                    domain: "meta",
                    field: "profile",
                    message: `Invalid profile value: ${declaredProfile}. Must be essential, extended, or full.`
                }],
            domainCount: 0,
            fieldCount: 0,
        };
    }
    const profileFields = getProfileFields(declaredProfile);
    const allowedDomains = new Set(Object.keys(profileFields));
    const presentDomains = new Set(Object.keys(obj));
    let fieldCount = 0;
    // Check for extra domains (domains present but not in profile)
    for (const domain of presentDomains) {
        if (!allowedDomains.has(domain)) {
            errors.push({
                type: "extra_domain",
                domain,
                message: `Domain '${domain}' is not allowed in ${declaredProfile} profile`,
            });
        }
    }
    // Check for missing domains and field conformance
    for (const [domain, allowedFields] of Object.entries(profileFields)) {
        if (!presentDomains.has(domain)) {
            errors.push({
                type: "missing_domain",
                domain,
                message: `Required domain '${domain}' is missing from ${declaredProfile} profile artifact`,
            });
            continue;
        }
        const domainData = obj[domain];
        if (!domainData || typeof domainData !== "object") {
            errors.push({
                type: "missing_domain",
                domain,
                message: `Domain '${domain}' must be an object`,
            });
            continue;
        }
        const domainObj = domainData;
        const allowedFieldSet = new Set(allowedFields);
        const presentFields = Object.keys(domainObj);
        // Check for extra fields
        for (const field of presentFields) {
            if (!allowedFieldSet.has(field)) {
                errors.push({
                    type: "extra_field",
                    domain,
                    field,
                    message: `Field '${domain}.${field}' is not allowed in ${declaredProfile} profile`,
                });
            }
            else {
                fieldCount++;
            }
        }
        // Check for missing required fields
        for (const requiredField of allowedFields) {
            if (!(requiredField in domainObj)) {
                errors.push({
                    type: "missing_field",
                    domain,
                    field: requiredField,
                    message: `Required field '${domain}.${requiredField}' is missing from ${declaredProfile} profile artifact`,
                });
            }
        }
        // Special handling for nested governance fields
        if (domain === "governance") {
            validateGovernanceNested(domainObj, declaredProfile, errors);
        }
    }
    return {
        conformant: errors.length === 0,
        profile: declaredProfile,
        errors,
        domainCount: [...presentDomains].filter(d => allowedDomains.has(d)).length,
        fieldCount,
    };
}
/**
 * Validate nested governance fields for profile conformance
 */
function validateGovernanceNested(governance, profile, errors) {
    // retention_policy nested fields
    if (governance.retention_policy && typeof governance.retention_policy === "object") {
        const rp = governance.retention_policy;
        const allowedRpFields = ["basis", "ttl_days", "on_expiry"];
        for (const field of Object.keys(rp)) {
            if (!allowedRpFields.includes(field)) {
                errors.push({
                    type: "extra_field",
                    domain: "governance",
                    field: `retention_policy.${field}`,
                    message: `Nested field 'governance.retention_policy.${field}' is not allowed in ${profile} profile`,
                });
            }
        }
    }
    // subject_rights nested fields
    if (governance.subject_rights && typeof governance.subject_rights === "object") {
        const sr = governance.subject_rights;
        const allowedSrFields = ["portable", "erasable", "explainable"];
        for (const field of Object.keys(sr)) {
            if (!allowedSrFields.includes(field)) {
                errors.push({
                    type: "extra_field",
                    domain: "governance",
                    field: `subject_rights.${field}`,
                    message: `Nested field 'governance.subject_rights.${field}' is not allowed in ${profile} profile`,
                });
            }
        }
    }
    // Full profile allows additional governance fields
    if (profile !== "full") {
        const extraGovFields = ["k_anonymity", "policy_labels", "masking_rules"];
        for (const field of extraGovFields) {
            if (field in governance) {
                errors.push({
                    type: "extra_field",
                    domain: "governance",
                    field,
                    message: `Field 'governance.${field}' is not allowed in ${profile} profile`,
                });
            }
        }
    }
}
// =============================================================================
// Schema Validation
// =============================================================================
/**
 * Validate an EDM artifact against the v0.6.0 schema
 * Note: This validates against full schema. Use validateProfileConformance
 * for profile-specific validation.
 */
export function validateEDM(artifact) {
    const result = EdmArtifactSchema.safeParse(artifact);
    if (result.success) {
        return {
            valid: true,
            errors: [],
        };
    }
    return {
        valid: false,
        errors: formatZodErrors(result.error),
    };
}
/**
 * Validate artifact against both schema and profile conformance
 */
export function validateEDMWithProfile(artifact) {
    // First check profile conformance
    const profileResult = validateProfileConformance(artifact);
    // For profile-specific validation, we can't use the full schema
    // because it expects all 10 domains. Instead, check the profile result.
    if (!profileResult.conformant) {
        return {
            valid: false,
            errors: profileResult.errors.map(e => ({
                path: e.field ? `${e.domain}.${e.field}` : e.domain,
                message: e.message,
                code: e.type,
            })),
            profileResult,
        };
    }
    return {
        valid: true,
        errors: [],
        profileResult,
    };
}
/**
 * Validate and return typed artifact or throw
 */
export function validateEDMStrict(artifact) {
    return EdmArtifactSchema.parse(artifact);
}
/**
 * Format Zod errors into ValidationError array
 */
function formatZodErrors(error) {
    return error.errors.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
    }));
}
import { MetaSchema, CoreSchema, ConstellationSchema, MilkyWaySchema, GravitySchema, ImpulseSchema, GovernanceSchema, TelemetrySchema, SystemSchema, CrosswalksSchema, } from "./schema/edm-schema.js";
const domainSchemas = {
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
};
export function validateDomain(domain, data) {
    const schema = domainSchemas[domain];
    const result = schema.safeParse(data);
    if (result.success) {
        return {
            valid: true,
            errors: [],
        };
    }
    return {
        valid: false,
        errors: formatZodErrors(result.error).map((err) => ({
            ...err,
            path: `${domain}.${err.path}`,
        })),
    };
}
export function validateCompleteness(artifact) {
    const missingFields = [];
    let totalFields = 0;
    let populatedFields = 0;
    // Check required fields across domains
    const requiredPaths = [
        "meta.version",
        "meta.created_at",
        "meta.visibility",
        "meta.pii_tier",
        "meta.source_type",
        "meta.consent_basis",
        "constellation.emotion_subtone",
        "constellation.transformational_pivot",
        "milky_way.associated_people",
        "gravity.emotional_weight",
        "gravity.recall_triggers",
        "gravity.retrieval_keys",
        "gravity.nearby_themes",
        "gravity.legacy_embed",
        "gravity.strength_score",
        "gravity.resilience_markers",
        "governance.subject_rights",
        "governance.exportability",
        "governance.policy_labels",
        "governance.masking_rules",
        "telemetry.entry_confidence",
        "system.embeddings",
        "system.indices",
    ];
    for (const path of requiredPaths) {
        totalFields++;
        const value = getNestedValue(artifact, path);
        if (value === null || value === undefined) {
            missingFields.push(path);
        }
        else {
            populatedFields++;
        }
    }
    // Also count optional field population
    const optionalPaths = [
        "core.anchor",
        "core.spark",
        "core.wound",
        "core.fuel",
        "core.bridge",
        "core.echo",
        "core.narrative",
        "constellation.emotion_primary",
        "constellation.narrative_arc",
        "constellation.relational_dynamics",
        "constellation.temporal_context",
        "constellation.memory_type",
        "constellation.narrative_archetype",
        "milky_way.event_type",
        "milky_way.location_context",
        "impulse.primary_energy",
        "impulse.drive_state",
        "impulse.motivational_orientation",
    ];
    for (const path of optionalPaths) {
        totalFields++;
        const value = getNestedValue(artifact, path);
        if (value !== null && value !== undefined && value !== "") {
            populatedFields++;
        }
    }
    return {
        complete: missingFields.length === 0,
        missingFields,
        populationRate: Math.round((populatedFields / totalFields) * 100) / 100,
    };
}
function getNestedValue(obj, path) {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current === "object") {
            current = current[part];
        }
        else {
            return undefined;
        }
    }
    return current;
}
//# sourceMappingURL=validator.js.map