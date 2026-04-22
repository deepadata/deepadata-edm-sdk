/**
 * Single source of truth for the EDM schema version emitted by this SDK.
 *
 * MUST be updated when the SDK targets a new EDM spec version.
 * Coherence is enforced by tests/version-coherence.test.ts which
 * asserts this matches the canonical example artefact in edm-spec.
 *
 * Per whitepaper §11.4: declared version governs interpretation.
 * Stale values cause downstream readers to misinterpret artefacts.
 */
export declare const EDM_SCHEMA_VERSION: "0.8.0";
//# sourceMappingURL=version.d.ts.map