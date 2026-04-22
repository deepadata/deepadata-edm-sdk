/**
 * Version Coherence Test
 *
 * Ensures EDM_SCHEMA_VERSION in src/version.ts matches the canonical
 * example artifacts in deepadata-edm-spec. This prevents stale version
 * stamps from being published.
 *
 * Per whitepaper §11.4: declared version governs interpretation.
 * Mismatched versions cause downstream readers to misinterpret artifacts.
 */
import { describe, test, expect } from "vitest";
import { EDM_SCHEMA_VERSION } from "../src/version.js";

// Import canonical examples from sibling edm-spec repo
// These are the authoritative source for the current EDM version
import journalingExample from "../../deepadata-edm-spec/examples/example-partner-journaling.json";

describe("EDM schema version coherence", () => {
  test("EDM_SCHEMA_VERSION matches canonical partner artefact", () => {
    expect(journalingExample.meta.version).toBe(EDM_SCHEMA_VERSION);
  });

  test("EDM_SCHEMA_VERSION is a valid semver string", () => {
    expect(EDM_SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("EDM_SCHEMA_VERSION is exported as const", () => {
    // Type check: EDM_SCHEMA_VERSION should be a literal type, not just string
    const version: typeof EDM_SCHEMA_VERSION = EDM_SCHEMA_VERSION;
    expect(version).toBe("0.8.0");
  });
});
