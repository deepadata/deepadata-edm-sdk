/**
 * Version Coherence Test
 *
 * EDM_SCHEMA_VERSION is DERIVED from the installed `edm-spec` package
 * (src/version.ts) — this test proves the derivation and its coherence
 * with the spec's own canonical example artifacts, so a stale or
 * mismatched stamp can never be published.
 *
 * Per whitepaper §11.4: declared version governs interpretation.
 * Mismatched versions cause downstream readers to misinterpret artifacts.
 */
import { describe, test, expect } from "vitest";
import { createRequire } from "node:module";
import {
  EDM_SCHEMA_VERSION,
  EDM_VERSION_LINE,
  EDM_SCHEMA_URL_VERSION,
  EDM_VERSION_LABEL,
} from "../src/version.js";

const require = createRequire(import.meta.url);

describe("EDM schema version coherence", () => {
  test("EDM_SCHEMA_VERSION equals the installed edm-spec package version", () => {
    const specPkg = require("edm-spec/package.json") as { version: string };
    expect(EDM_SCHEMA_VERSION).toBe(specPkg.version);
  });

  test("EDM_SCHEMA_VERSION matches the spec's canonical profile examples", () => {
    for (const profile of ["essential", "extended", "full"] as const) {
      const example = require(`edm-spec/examples/example-${profile}-profile.json`) as {
        meta: { version: string };
      };
      expect(example.meta.version).toBe(EDM_SCHEMA_VERSION);
    }
  });

  test("EDM_SCHEMA_VERSION is a valid semver string", () => {
    expect(EDM_SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("derived version constants are coherent", () => {
    expect(EDM_SCHEMA_VERSION.startsWith(`${EDM_VERSION_LINE}.`)).toBe(true);
    expect(EDM_SCHEMA_URL_VERSION).toBe(`v${EDM_VERSION_LINE}.0`);
    expect(EDM_VERSION_LABEL).toBe(`v${EDM_SCHEMA_VERSION}`);
  });
});
