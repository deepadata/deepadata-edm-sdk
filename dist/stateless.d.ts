/**
 * Stateless Mode for EDM v0.4.0
 * Creates privacy-preserving versions of artifacts for session use
 *
 * Stateless artifacts:
 * - Remove owner identification
 * - Null out sensitive contextual fields
 * - Preserve emotional structure for session continuity
 */
import type { EdmArtifact } from "./schema/types.js";
/**
 * Create a stateless version of an EDM artifact
 * Removes identifying information while preserving emotional structure
 */
export declare function createStatelessArtifact(artifact: EdmArtifact): EdmArtifact;
/**
 * Check if an artifact is in stateless mode
 */
export declare function isStateless(artifact: EdmArtifact): boolean;
/**
 * Validate stateless compliance
 */
export interface StatelessValidation {
    compliant: boolean;
    violations: string[];
}
export declare function validateStateless(artifact: EdmArtifact): StatelessValidation;
//# sourceMappingURL=stateless.d.ts.map