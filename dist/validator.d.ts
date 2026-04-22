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
 * Validate an EDM artifact against its declared profile schema
 *
 * Profile-aware validation:
 * - Detects meta.profile value (defaults to "full" if not specified)
 * - Essential/Extended profiles: validates domain/field conformance only
 * - Full profile: validates against complete Zod schema
 *
 * This ensures Essential (5 domains) and Extended (7 domains) artifacts
 * pass validation without requiring all 10 domains.
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