import type { EdmArtifact, ValidationResult, EdmProfile } from "./schema/types.js";
export type DomainName = "meta" | "core" | "constellation" | "milky_way" | "gravity" | "impulse" | "governance" | "telemetry" | "system" | "crosswalks";
export interface ProfileConformanceWarning {
    type: "partner_profile";
    message: string;
}
export interface ProfileConformanceResult {
    conformant: boolean;
    profile: EdmProfile;
    errors: ProfileConformanceError[];
    warnings?: ProfileConformanceWarning[];
    domainCount: number;
    fieldCount: number;
}
export interface ProfileConformanceError {
    type: "missing_domain" | "extra_domain" | "missing_field" | "extra_field";
    domain: string;
    field?: string;
    message: string;
}
/**
 * Validate that an artifact conforms to its declared profile
 * Per EDM Profile Invariants:
 * - Artifact MUST contain only domains defined for declared profile
 * - Artifact MUST contain only fields defined for declared profile
 * - Out-of-profile domains/fields MUST be omitted entirely
 */
export declare function validateProfileConformance(artifact: unknown): ProfileConformanceResult;
/**
 * Validate an EDM artifact against its DECLARED profile's schema surface.
 *
 * Profile-aware validation (defect fix, 2026-07-22 — validateEDM used to
 * value-check essential/extended domains against the FULL domain zod
 * schemas, whose required keys — meta.source_type, core.narrative,
 * governance.exportability, telemetry.extraction_notes — do not exist at
 * those profiles, so an essential artifact could never pass):
 *
 * 1. detect meta.profile (defaults to "full" when absent/invalid)
 * 2. structural conformance — domain/field membership from the profile
 *    manifests (drift-guarded restatements of the spec composites);
 *    required-ness from the spec composites/fragments
 * 3. value validation — each present domain is checked against the full
 *    domain zod schema NARROWED to the profile's field set and made
 *    partial (`pick(profileFields).partial()`): every present field's
 *    VALUE is validated, while required-ness stays with step 2 where the
 *    spec, not zod key-optionality, is the authority
 *
 * Partner profiles (`partner:<id>`): structural completeness is skipped
 * pending registry lookup (ADR-0012); values of canonical domains that
 * are present are still validated against the full domain schemas
 * (partial), so a partner artifact with a malformed canonical field fails.
 */
export declare function validateEDM(artifact: unknown): ValidationResult;
/**
 * Validate artifact against both schema and profile conformance
 */
export declare function validateEDMWithProfile(artifact: unknown): ValidationResult & {
    profileResult: ProfileConformanceResult;
};
/**
 * Validate and return typed artifact or throw
 */
export declare function validateEDMStrict(artifact: unknown): EdmArtifact;
/**
 * Validate specific domain
 */
export declare function validateDomain(domain: DomainName, data: unknown): ValidationResult;
/**
 * Validate artifact completeness (non-null required fields)
 */
export interface CompletenessResult {
    complete: boolean;
    missingFields: string[];
    populationRate: number;
}
export declare function validateCompleteness(artifact: EdmArtifact): CompletenessResult;
//# sourceMappingURL=validator.d.ts.map