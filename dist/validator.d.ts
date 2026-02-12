import type { EdmArtifact, ValidationResult } from "./schema/types.js";
/**
 * Validate an EDM artifact against the v0.5.0 schema
 */
export declare function validateEDM(artifact: unknown): ValidationResult;
/**
 * Validate and return typed artifact or throw
 */
export declare function validateEDMStrict(artifact: unknown): EdmArtifact;
/**
 * Validate specific domain
 */
export type DomainName = "meta" | "core" | "constellation" | "milky_way" | "gravity" | "impulse" | "governance" | "telemetry" | "system" | "crosswalks";
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