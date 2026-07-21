export interface SpecSchemaNode {
    type?: string | string[];
    enum?: (string | null)[];
    "x-edm-canonical"?: string[];
    properties?: Record<string, SpecSchemaNode>;
    required?: string[];
    $ref?: string;
    oneOf?: SpecSchemaNode[];
    [k: string]: unknown;
}
export type CanonicalProfile = "essential" | "extended" | "full";
/**
 * Composite schema path inside the installed spec for a profile. The
 * filename version segment is the LINE (edm.v0.8.*) — derived from the
 * installed version, not restated.
 */
export declare function specCompositePath(profile: CanonicalProfile): string;
export declare function specFragmentPath(domain: string): string;
export declare function loadComposite(profile: CanonicalProfile): SpecSchemaNode;
export declare function loadFragment(domain: string): SpecSchemaNode;
export interface SpecProfileShape {
    /** Domains the profile contains, in composite order. */
    domains: string[];
    /** Domains the composite marks required. */
    requiredDomains: string[];
    /** Allowed field set per domain (the composite property set). */
    fields: Record<string, string[]>;
    /** Required field set per domain (composite/fragment `required`). */
    requiredFields: Record<string, string[]>;
}
/**
 * The spec's shape for a canonical profile: domain membership, field
 * membership, and required-ness — the mechanical truth the validator and
 * the drift guard consume.
 */
export declare function specProfileShape(profile: CanonicalProfile): SpecProfileShape;
/**
 * Canonical vocabulary of a field, searched across all fragments:
 * hard-enum fields contribute `enum` (nulls stripped); two-tier free-text
 * fields contribute `x-edm-canonical`. Throws when the field exists but
 * has neither, or is not found at all — a missing vocabulary is a wiring
 * error, never a silent empty list.
 */
export declare function specVocabOf(field: string): readonly string[];
/**
 * Vocabulary of a NESTED field (e.g. governance.retention_policy.basis),
 * addressed as "<fragment>.<field>.<nested>".
 */
export declare function specNestedVocabOf(fragment: string, field: string, nested: string): readonly string[];
//# sourceMappingURL=spec-truth.d.ts.map